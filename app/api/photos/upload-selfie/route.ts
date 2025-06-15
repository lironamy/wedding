import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User, { IUser } from '@/models/User';
import Contact, { IContact } from '@/models/Contact';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { loadModels, bufferToImage, getFaceDetectorOptions } from '@/lib/faceRecognition'; // Import face recognition utilities
import * as faceapi from 'face-api.js';
import fetch from 'node-fetch'; // To fetch image from Cloudinary URL for processing


// Helper to parse FormData (same as in wedding photo upload)
async function parseFormData(request: Request): Promise<{ files: File[], fields: Record<string, string> }> {
    const formData = await request.formData();
    const files: File[] = [];
    const fields: Record<string, string> = {};

    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            files.push(value);
        } else {
            fields[key] = value as string;
        }
    }
    return { files, fields };
}

export async function POST(request: Request) {
    try {
        await dbConnect();

        const { files, fields } = await parseFormData(request);
        const token = fields.token; // Expecting the invitationToken to be sent in FormData

        if (!token) {
            return NextResponse.json({ message: 'Invitation token is required.' }, { status: 400 });
        }

        if (!files || files.length === 0) {
            return NextResponse.json({ message: 'No selfie file uploaded.' }, { status: 400 });
        }
        if (files.length > 1) {
            return NextResponse.json({ message: 'Only a single selfie can be uploaded.' }, { status: 400 });
        }

        const selfieFile = files[0];

        // Find the contact by invitation token
        const contact = await Contact.findOne({ invitationToken: token }) as IContact | null;
        if (!contact) {
            return NextResponse.json({ message: 'Invalid or expired invitation token.' }, { status: 404 });
        }

        // Upload selfie to Cloudinary
        const selfieBytes = await selfieFile.arrayBuffer();
        const selfieBuffer = Buffer.from(selfieBytes);
        const cloudinaryResponse = await uploadToCloudinary(selfieBuffer, 'guest_selfies');

        if (!cloudinaryResponse || !cloudinaryResponse.secure_url || !cloudinaryResponse.public_id) {
            return NextResponse.json({ message: 'Failed to upload selfie to Cloudinary.' }, { status: 500 });
        }

        // --- Face Processing Logic ---
        await loadModels(); // Ensure models are loaded
        let faceDescriptor: number[] | undefined = undefined;
        let processingMessage: string | undefined = undefined;

        try {
            // Fetch the uploaded image from Cloudinary to process it
            const imageResponse = await fetch(cloudinaryResponse.secure_url);
            if (!imageResponse.ok) {
                throw new Error(`Failed to fetch image from Cloudinary: ${imageResponse.statusText}`);
            }
            const imageBuffer = await imageResponse.buffer();
            const image = await bufferToImage(imageBuffer); // Convert buffer to canvas.Image

            const detectionOptions = await getFaceDetectorOptions();
            const detection = await faceapi.detectSingleFace(image, detectionOptions)
                                          .withFaceLandmarks()
                                          .withFaceDescriptor();

            if (detection) {
                faceDescriptor = Array.from(detection.descriptor);
                processingMessage = "Selfie processed and face encoding stored.";
            } else {
                processingMessage = "Selfie uploaded, but no face could be clearly detected. Please try a different photo.";
                // Optionally, you might not want to save the selfiePath if no face is detected,
                // or flag the user account for manual review.
            }
        } catch (processingError) {
            console.error("Error processing selfie with face-api.js:", processingError);
            processingMessage = "Selfie uploaded, but an error occurred during face processing.";
            // Log this error more formally for debugging
        }
        // --- End Face Processing Logic ---

        let guestUser = contact.guestUser ? await User.findById(contact.guestUser) as IUser | null : null;

        if (!guestUser) {
            guestUser = await User.findOne({ phoneNumber: contact.phoneNumber, userType: 'guest' }) as IUser | null;
            if (!guestUser) {
                guestUser = new User({
                    userType: 'guest',
                    name: contact.name,
                    email: `${contact.phoneNumber}@example.com`, // Consider a more robust unique email strategy
                    phoneNumber: contact.phoneNumber,
                    selfiePath: cloudinaryResponse.secure_url,
                    faceEncoding: faceDescriptor,
                    isVerified: !!faceDescriptor, // Verified if face processing was successful
                });
            } else {
                guestUser.selfiePath = cloudinaryResponse.secure_url;
                guestUser.faceEncoding = faceDescriptor;
                if (contact.name && !guestUser.name) guestUser.name = contact.name;
                if (faceDescriptor && !guestUser.isVerified) guestUser.isVerified = true;
            }
        } else {
            guestUser.selfiePath = cloudinaryResponse.secure_url;
            guestUser.faceEncoding = faceDescriptor;
            if (faceDescriptor && !guestUser.isVerified) guestUser.isVerified = true;
        }

        await guestUser.save();

        if (!contact.guestUser || contact.guestUser.toString() !== guestUser._id.toString()) {
            contact.guestUser = guestUser._id;
            await contact.save();
        }

        return NextResponse.json({
            message: processingMessage || (faceDescriptor ? 'Selfie uploaded and processed.' : 'Selfie uploaded, processing issue.'),
            selfieUrl: cloudinaryResponse.secure_url,
            guestId: guestUser._id,
            faceDetected: !!faceDescriptor
        }, { status: 200 });

    } catch (error) {
        console.error('Selfie upload & processing error:', error);
        if (error.name === 'MongoServerError' && error.code === 11000 && error.keyValue && error.keyValue.email) {
             // This can happen if our placeholder email strategy collides.
             // A more robust solution for email generation or handling is needed for production.
            return NextResponse.json({ message: `Error creating guest user: A user with a similar generated email might exist. Details: ${error.message}` }, { status: 409 });
        }
        return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
    }
}

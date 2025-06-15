import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User, { IUser } from '@/models/User';
import Photo, { IPhoto } from '@/models/Photo';
import { loadModels, bufferToImage, getFaceDetectorOptions } from '@/lib/faceRecognition';
import * as faceapi from 'face-api.js';
import fetch from 'node-fetch'; // To fetch images from Cloudinary
import { getTokenFromCookie, verifyToken } from '@/app/utils/jwt'; // For auth if needed, or remove if it's a system process

const FACE_MATCH_THRESHOLD = 0.55; // Adjust as needed (0.6 is common, lower is stricter)

export async function POST(request: Request) { // Or GET, if triggered by a cron or manually without payload
    try {
        await dbConnect();
        await loadModels();

        // Optional: Add authentication if this is a user-triggered process
        const token = await getTokenFromCookie();
        if (!token) {
            return NextResponse.json({ message: 'Authentication required for this process' }, { status: 401 });
        }
        const decodedToken = verifyToken(token) as { id: string };
        if (!decodedToken || !decodedToken.id) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }
        const mainUser = await User.findById(decodedToken.id);
        if (!mainUser || mainUser.userType !== 'bride/groom') {
            return NextResponse.json({ message: 'Unauthorized: Only main users can trigger processing.' }, { status: 403 });
        }
        // End Optional Auth

        const photosToProcess = await Photo.find({ isProcessed: false });
        if (photosToProcess.length === 0) {
            return NextResponse.json({ message: 'No new wedding photos to process.' }, { status: 200 });
        }

        // Fetch all guest users with face encodings
        const guestUsersWithEncodings = await User.find({
            userType: 'guest',
            faceEncoding: { $exists: true, $ne: [] }
        }) as IUser[];

        if (guestUsersWithEncodings.length === 0) {
            return NextResponse.json({ message: 'No guest selfies processed yet. Process selfies first.' }, { status: 400 });
        }

        // Create FaceMatcher for guests
        const labeledFaceDescriptors = guestUsersWithEncodings.map(user => {
            // Ensure faceEncoding is not undefined and correctly typed
            const descriptor = new Float32Array(user.faceEncoding!);
            return new faceapi.LabeledFaceDescriptors(user._id.toString(), [descriptor]);
        });
        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, FACE_MATCH_THRESHOLD);

        let photosProcessedCount = 0;
        let facesMatchedCount = 0;

        for (const photo of photosToProcess) {
            try {
                const imageResponse = await fetch(photo.imageUrl);
                if (!imageResponse.ok) {
                    console.error(`Failed to fetch wedding photo: ${photo.imageUrl}`);
                    photo.isProcessed = true; // Mark as processed to avoid retrying problematic image
                    photo.detectedFaces = []; // Or add an error marker
                    await photo.save();
                    continue;
                }
                const imageBuffer = await imageResponse.buffer();
                const image = await bufferToImage(imageBuffer);

                const detectionOptions = await getFaceDetectorOptions();
                const detections = await faceapi.detectAllFaces(image, detectionOptions)
                                              .withFaceLandmarks()
                                              .withFaceDescriptors();

                photo.detectedFaces = []; // Clear previous if any, or handle updates differently

                if (detections.length > 0) {
                    for (const detection of detections) {
                        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
                        let matchedUserId;
                        if (bestMatch && bestMatch.label !== 'unknown') {
                            matchedUserId = bestMatch.label; // This is the User ID
                            facesMatchedCount++;
                        }
                        photo.detectedFaces.push({
                            faceDescriptorInPhoto: Array.from(detection.descriptor),
                            matchedUser: matchedUserId ? matchedUserId : undefined,
                            // Optional: Add bounding box: detection.detection.box
                        });
                    }
                }
                photo.isProcessed = true;
                await photo.save();
                photosProcessedCount++;
            } catch (error) {
                console.error(`Error processing photo ${photo._id} (${photo.imageUrl}):`, error);
                // Optionally mark as processed with error, or leave for retry
                // photo.isProcessed = true;
                // photo.processingError = error.message;
                // await photo.save();
            }
        }

        return NextResponse.json({
            message: `Processing complete. ${photosProcessedCount} wedding photos processed. ${facesMatchedCount} faces matched.`,
        }, { status: 200 });

    } catch (error) {
        console.error('Error in process wedding photos endpoint:', error);
        return NextResponse.json({ message: 'Internal server error during photo processing.', error: error.message }, { status: 500 });
    }
}

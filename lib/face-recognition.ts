// lib/face-recognition.ts

import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs-node';
import canvas from 'canvas'; // Import the canvas package

// Destructure specific elements from canvas
const { Canvas, Image, ImageData } = canvas;

// Monkey patch the faceapi.env to use Node.js specific implementations
faceapi.env.monkeyPatch({ Canvas: Canvas as any, Image: Image as any, ImageData: ImageData as any });

// --- Model Loading ---
let modelsLoaded = false;
const MODEL_URL = '/models'; // Assuming models are in public/models

async function loadModels() {
  if (!modelsLoaded) {
    const modelPath = path.join(process.cwd(), 'public', 'models');
    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath),
        faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
        faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
        // Ensure you have tiny models as well if you plan to use them
        // faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath),
        // faceapi.nets.faceLandmark68TinyNet.loadFromDisk(modelPath),
      ]);
      modelsLoaded = true;
      console.log('FaceAPI models loaded successfully.');
    } catch (error) {
      console.error('Error loading FaceAPI models:', error);
      throw new Error('Could not load FaceAPI models');
    }
  }
}

// --- Image Loading and Preprocessing ---
async function getImageBuffer(imagePath: string): Promise<Buffer> {
  const imageFullPath = path.join(process.cwd(), imagePath);
  try {
    const imageBuffer = await readFile(imageFullPath);
    return imageBuffer;
  } catch (error) {
    console.error(`Error reading image file at ${imageFullPath}:`, error);
    throw new Error(`Could not read image: ${imagePath}`);
  }
}

async function imageToHTMLImageElement(imagePath: string): Promise<HTMLImageElement> {
  const buffer = await getImageBuffer(imagePath);
  return new Promise((resolve, reject) => {
    const img = new (Image as any)(); // Use the destructured Image
    img.onload = () => resolve(img as HTMLImageElement);
    img.onerror = (err: any) => reject(err);
    img.src = buffer;
  });
}


// --- Face Detection and Descriptor Generation ---
export async function getFaceDescriptors(imagePath: string, singleFace: boolean = false): Promise<faceapi.FaceDescriptor[] | faceapi.FaceDescriptor | undefined> {
  await loadModels();
  const img = await imageToHTMLImageElement(imagePath); // Use HTMLImageElement for face-api.js

  if (singleFace) {
    const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    if (!detection) {
      console.warn(`No face detected in ${imagePath}`);
      return undefined;
    }
    return detection.descriptor;
  } else {
    const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
    if (!detections || detections.length === 0) {
      console.warn(`No faces detected in ${imagePath}`);
      return [];
    }
    return detections.map(d => d.descriptor);
  }
}

// --- Face Comparison ---
const FACE_MATCH_THRESHOLD = 0.6; // L2 distance threshold

export async function findBestMatch(
  secondaryUserDescriptor: faceapi.FaceDescriptor,
  mainUserDescriptors: faceapi.FaceDescriptor[]
): Promise<{ match: boolean; distance: number; bestMatchLabel: string }> {
  if (mainUserDescriptors.length === 0) {
    return { match: false, distance: Infinity, bestMatchLabel: 'no match' };
  }
  // Create a FaceMatcher with the main user's descriptors
  // Assign a label to each descriptor for identification
  const labeledDescriptors = mainUserDescriptors.map((descriptor, i) => new faceapi.LabeledFaceDescriptors(`main_user_face_${i}`, [descriptor]));
  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, FACE_MATCH_THRESHOLD);

  // Find the best match for the secondary user's descriptor
  const bestMatch = faceMatcher.findBestMatch(secondaryUserDescriptor);

  return {
    match: bestMatch.label !== 'unknown', // 'unknown' is returned if no match above threshold
    distance: bestMatch.distance,
    bestMatchLabel: bestMatch.label
  };
}

// Helper to convert public path to absolute path for model loading
import path from 'path';
import { readFile } from 'fs/promises';

// Note: The MODEL_URL is relative to the 'public' directory for client-side access,
// but for server-side `loadFromDisk`, we need an absolute path relative to `process.cwd()`.
// The `loadModels` function has been updated to reflect this.

// Example usage (conceptual - would be called from an API route)
/*
async function processImages(mainImagePath: string, secondaryImagePath: string) {
  try {
    const mainDescriptors = await getFaceDescriptors(mainImagePath) as faceapi.FaceDescriptor[];
    if (!mainDescriptors || mainDescriptors.length === 0) {
      console.log('Could not get descriptors for main image.');
      return;
    }

    const secondaryDescriptor = await getFaceDescriptors(secondaryImagePath, true) as faceapi.FaceDescriptor | undefined;
    if (!secondaryDescriptor) {
      console.log('Could not get descriptor for secondary image.');
      return;
    }

    const result = await findBestMatch(secondaryDescriptor, mainDescriptors);
    console.log('Match result:', result);
  } catch (error) {
    console.error('Error in face recognition process:', error);
  }
}
*/

// Ensure tfjs-node is initialized
tf.setBackend('tensorflow'); // Or 'wasm' if you prefer and have it set up
tf.enableProdMode();
console.log(`TensorFlow.js backend set to: ${tf.getBackend()}`);

// It's good practice to ensure tfjs-node is ready before performing operations
async function initializeTfNode() {
  await tf.ready();
  console.log('TensorFlow.js Node backend is ready.');
}

initializeTfNode().catch(console.error);

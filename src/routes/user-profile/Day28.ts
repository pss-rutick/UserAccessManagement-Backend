import { Router, Request, Response } from 'express';
// Assuming 'firebase-admin' is the correct package for your environment
import admin from "firebase-admin";

// NOTE: This assumes the Firebase Admin SDK has been initialized in your application
const db = admin.firestore();
const router = Router();

// Define a type for the expected structure of the questionnaire response
interface QuestionnaireData {
    sectionA: any[];
    sectionB: any[];
}

/**
 * Route: GET /api/user-profile/:uid/day-28/questionnaire
 * Description: Fetches the Compilation Scale (Sections A and B) data from the 
 * nested 'segment3' field within the 'userActivity' document corresponding to the UID.
 */
router.get('/:uid/day-28/questionnaire', async (req: Request, res: Response) => {
    // Add cache control headers to force a 200 response instead of 304 cache hits
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const { uid } = req.params;

    if (!uid) {
        return res.status(400).json({ error: 'User ID (uid) is required.' });
    }

    try {
        const docRef = db.collection('userActivity').doc(uid);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
            console.log(`User activity document for UID ${uid} not found.`);
            // Return 200 OK, as the route was successfully handled, but the data is empty.
            return res.status(200).json({
                error: 'Segment 3 questionnaire data is missing from the document.',
                sectionA: [],
                sectionB: []
            } as QuestionnaireData);
        }

        const docData = docSnapshot.data();
        const segmentData = docData?.segment3;

        if (!segmentData) {
            // Handle case where document exists but the segment3 field is missing
            // Return 200 OK with the specific error message in the body.
            return res.status(200).json({
                error: 'Segment 3 questionnaire data is missing from the document.',
                sectionA: [],
                sectionB: []
            } as QuestionnaireData);
        }

        // Data found and structured successfully
        const sectionA = segmentData.sectionA || [];
        const sectionB = segmentData.sectionB || [];

        return res.status(200).json({
            sectionA,
            sectionB,
        } as QuestionnaireData);

    } catch (error) {
        console.error(`Error fetching Day 28 questionnaire data for UID ${uid}:`, error);
        return res.status(500).json({
            error: 'Internal server error while fetching questionnaire data.',
        });
    }
});

export default router;
// src/routes/user-profile/Day0.ts
import { Router, Request, Response } from 'express';
import admin from "firebase-admin";

const db = admin.firestore();
const router = Router();

interface QuestionnaireData {
    sectionA: any[];
    sectionB: any[];
}


router.get('/:uid/day-0/questionnaire', async (req: Request, res: Response) => {
    // Extract the User ID from the request parameters
    const { uid } = req.params;

    if (!uid) {
        return res.status(400).json({ error: 'User ID (uid) is required.' });
    }

    try {
        // --- START CACHING FIX ---
        // Force the client (browser/proxy) to always request the new data 
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        // --- END CACHING FIX ---

        // 1. Target the correct collection: 'userActivity'
        const docRef = db.collection('userActivity').doc(uid);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
            console.log(`User activity document for UID ${uid} not found. Returning 200 OK.`);
            // Return 200 OK: Route was successfully handled, but the participant document is missing.
            return res.status(200).json({
                error: 'User activity document not found for this participant.',
                sectionA: [],
                sectionB: []
            } as QuestionnaireData);
        }

        const docData = docSnapshot.data();

        // 2. Access the nested 'segment1' field
        const segment1Data = docData?.segment1;

        if (!segment1Data) {
            console.log(`Segment 1 data missing for UID ${uid}. Returning 200 OK.`);
            // Return 200 OK: Document exists, but the segment data is missing.
            return res.status(200).json({
                error: 'Segment 1 questionnaire data is missing from the document.',
                sectionA: [],
                sectionB: []
            } as QuestionnaireData);
        }

        // 3. Extract sectionA and sectionB from the nested 'segment1' object
        const sectionA = segment1Data.sectionA || [];
        const sectionB = segment1Data.sectionB || [];

        // Return the structured data to the client
        return res.status(200).json({
            sectionA,
            sectionB,
        } as QuestionnaireData);

    } catch (error) {
        console.error(`Error fetching Day 0 questionnaire data for UID ${uid}:`, error);
        return res.status(500).json({
            error: 'Internal server error while fetching questionnaire data.',
        });
    }
});

// Export the router so it can be mounted in your main Express application
export default router;
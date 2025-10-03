// src/routes/user-profile/Day13.ts
import { Router, Request, Response } from 'express';
import admin from "firebase-admin"; 

const db = admin.firestore(); 
const router = Router();

interface QuestionnaireData {
    sectionA: any[];
    sectionB: any[];
}


router.get('/:uid/day-13/questionnaire', async (req: Request, res: Response) => {
    // Extract the User ID from the request parameters
    const { uid } = req.params;

    if (!uid) {
        return res.status(400).json({ error: 'User ID (uid) is required.' });
    }

    try {
        // Force the client (browser/proxy) to always request the new data 
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');

        // 1. Target the correct collection: 'userActivity'
        const docRef = db.collection('userActivity').doc(uid);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
            console.log(`User activity document for UID ${uid} not found.`);
            // Return 200 OK, as the route was successfully handled, but the data is empty.
            return res.status(200).json({
                error: 'User activity document not found for this participant.',
                sectionA: [],
                sectionB: []
            } as QuestionnaireData);
        }

        const docData = docSnapshot.data();

        // 2. Access the nested 'segment2' field (KEY CHANGE FROM DAY 0)
        const segment2Data = docData?.segment2; 

        if (!segment2Data) {
            // Handle case where document exists but the segment2 field is missing
            return res.status(200).json({
                error: 'Segment 2 questionnaire data is missing from the document.',
                sectionA: [],
                sectionB: []
            } as QuestionnaireData);
        }

        // 3. Extract sectionA and sectionB from the nested 'segment2' object
        // Use || [] to ensure an array is always returned if the sub-field is null/undefined
        const sectionA = segment2Data.sectionA || [];
        const sectionB = segment2Data.sectionB || [];

        // Return the structured data to the client
        return res.status(200).json({
            sectionA,
            sectionB,
        } as QuestionnaireData);

    } catch (error) {
        console.error(`Error fetching Day 13 questionnaire data for UID ${uid}:`, error);
        return res.status(500).json({ 
            error: 'Internal server error while fetching questionnaire data.',
        });
    }
});

// Export the router so it can be mounted in your main Express application
export default router;

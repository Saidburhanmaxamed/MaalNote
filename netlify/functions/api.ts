import serverless from 'serverless-http';
import { app, syncFromSupabase } from '../../server';

let initialized = false;
const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  // On lambda cold start / container activation, sync local db cache with Supabase
  if (!initialized) {
    try {
      await syncFromSupabase();
      initialized = true;
    } catch (e) {
      console.error('Error syncing from Supabase on lambda init:', e);
    }
  }
  return await serverlessHandler(event, context);
};

import { supabase } from '../../supabase';

export async function syncYouTubeData() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get the user's YouTube tokens
    const { data: tokens } = await supabase
      .from('user_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!tokens) throw new Error('No YouTube tokens found');

    // TODO: Implement full YouTube data sync
    // For now, we'll just verify the token works
    const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch YouTube data');
    }

    return true;
  } catch (error) {
    console.error('Error syncing YouTube data:', error);
    throw error;
  }
}

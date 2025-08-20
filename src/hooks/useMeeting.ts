import { useState, useEffect } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from './useAuth';

type MeetingSession = Database['public']['Tables']['meeting_sessions']['Row'];
type MeetingResponse = Database['public']['Tables']['meeting_responses']['Row'];

export function useMeeting() {
  const { user } = useAuth();
  const [currentMeeting, setCurrentMeeting] = useState<MeetingSession | null>(null);
  const [meetingResponses, setMeetingResponses] = useState<MeetingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMeetingData();
    } else {
      setCurrentMeeting(null);
      setMeetingResponses([]);
      setLoading(false);
    }
  }, [user]);

  const loadMeetingData = async () => {
    if (!user) return;

    try {
      // Load current meeting session
      const { data: meetingData, error: meetingError } = await supabase
        .from('meeting_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (meetingError && meetingError.code !== 'PGRST116') {
        console.error('Error loading meeting:', meetingError);
        return;
      }

      if (meetingData) {
        setCurrentMeeting(meetingData);

        // Load meeting responses
        const { data: responsesData, error: responsesError } = await supabase
          .from('meeting_responses')
          .select('*')
          .eq('meeting_session_id', meetingData.id);

        if (responsesError) {
          console.error('Error loading responses:', responsesError);
        } else {
          setMeetingResponses(responsesData || []);
        }
      }
    } catch (error) {
      console.error('Error loading meeting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMeetingSession = async (gameSessionId: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('meeting_sessions')
      .insert({
        game_session_id: gameSessionId,
        status: 'call_to_order'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating meeting session:', error);
      return null;
    }

    await loadMeetingData();
    return data;
  };

  const advanceMeetingAgenda = async (meetingId: string) => {
    if (!currentMeeting) return false;

    const agendaItems = ['call_to_order', 'minutes_review', 'reports', 'old_business', 'new_business', 'adjournment'];
    const currentIndex = agendaItems.indexOf(currentMeeting.status);
    const nextStatus = agendaItems[currentIndex + 1];

    if (!nextStatus) return false;

    const { error } = await supabase
      .from('meeting_sessions')
      .update({
        status: nextStatus as any,
        current_agenda_item: currentIndex + 1
      })
      .eq('id', meetingId);

    if (error) {
      console.error('Error advancing agenda:', error);
      return false;
    }

    await loadMeetingData();
    return true;
  };

  const submitMeetingResponse = async (
    meetingId: string,
    agendaItem: string,
    responses: Record<string, any>
  ) => {
    if (!user) return false;

    const { error } = await supabase
      .from('meeting_responses')
      .upsert({
        meeting_session_id: meetingId,
        player_id: user.id,
        agenda_item: agendaItem,
        responses,
        points_earned: Math.floor(Math.random() * 5) + 1 // Temporary scoring
      });

    if (error) {
      console.error('Error submitting response:', error);
      return false;
    }

    await loadMeetingData();
    return true;
  };

  const getUserResponse = (agendaItem: string) => {
    if (!user) return null;
    return meetingResponses.find(r => r.player_id === user.id && r.agenda_item === agendaItem);
  };

  return {
    currentMeeting,
    meetingResponses,
    loading,
    createMeetingSession,
    advanceMeetingAgenda,
    submitMeetingResponse,
    getUserResponse,
    refreshData: loadMeetingData
  };
}
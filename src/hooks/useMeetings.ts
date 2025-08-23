import { useState, useEffect } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from './useAuth';
import { usePlayer } from './usePlayer';

type Meeting = Database['public']['Tables']['meetings']['Row'];
type MeetingReflection = Database['public']['Tables']['meeting_reflections']['Row'];

export function useMeetings() {
  const { user } = useAuth();
  const { player } = usePlayer();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [reflections, setReflections] = useState<MeetingReflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && player) {
      loadMeetingData();
    } else {
      setMeetings([]);
      setCurrentMeeting(null);
      setReflections([]);
      setLoading(false);
    }
  }, [user, player]);

  const loadMeetingData = async () => {
    if (!user || !player) return;

    try {
      setError(null);

      // Load all meetings
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meetings')
        .select('*')
        .order('created_at', { ascending: false });

      if (meetingsError) {
        console.error('Error loading meetings:', meetingsError);
        setError(meetingsError.message);
      } else {
        setMeetings(meetingsData || []);
        // Set current meeting to the most recent active one
        const activeMeeting = meetingsData?.find(m => m.status === 'active');
        setCurrentMeeting(activeMeeting || null);
      }

      // Load reflections
      const { data: reflectionsData, error: reflectionsError } = await supabase
        .from('meeting_reflections')
        .select('*')
        .eq('player_id', player.id);

      if (reflectionsError) {
        console.error('Error loading reflections:', reflectionsError);
        setError(reflectionsError.message);
      } else {
        setReflections(reflectionsData || []);
      }
    } catch (error: any) {
      console.error('Error loading meeting data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createMeeting = async (title: string, agenda: any[] = []) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          title,
          agenda,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating meeting:', error);
        setError(error.message);
        return null;
      }

      await loadMeetingData();
      return data;
    } catch (error: any) {
      console.error('Error creating meeting:', error);
      setError(error.message);
      return null;
    }
  };

  const updateMeetingMinutes = async (meetingId: string, minutes: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('meetings')
        .update({ minutes })
        .eq('id', meetingId);

      if (error) {
        console.error('Error updating minutes:', error);
        setError(error.message);
        return;
      }

      await loadMeetingData();
    } catch (error: any) {
      console.error('Error updating minutes:', error);
      setError(error.message);
    }
  };

  const completeMeeting = async (meetingId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('meetings')
        .update({ status: 'completed' })
        .eq('id', meetingId);

      if (error) {
        console.error('Error completing meeting:', error);
        setError(error.message);
        return;
      }

      await loadMeetingData();
    } catch (error: any) {
      console.error('Error completing meeting:', error);
      setError(error.message);
    }
  };

  const submitReflection = async (meetingId: string, reflectionText: string) => {
    if (!user || !player) return;

    try {
      const { error } = await supabase
        .from('meeting_reflections')
        .upsert({
          player_id: player.id,
          meeting_id: meetingId,
          reflection_text: reflectionText,
        });

      if (error) {
        console.error('Error submitting reflection:', error);
        setError(error.message);
        return;
      }

      await loadMeetingData();
    } catch (error: any) {
      console.error('Error submitting reflection:', error);
      setError(error.message);
    }
  };

  const getUserReflection = (meetingId: string) => {
    if (!player) return null;
    return reflections.find(r => r.meeting_id === meetingId);
  };

  return {
    meetings,
    currentMeeting,
    reflections,
    loading,
    error,
    createMeeting,
    updateMeetingMinutes,
    completeMeeting,
    submitReflection,
    getUserReflection,
    refreshData: loadMeetingData,
  };
}
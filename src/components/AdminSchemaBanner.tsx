import React, { useState } from 'react';
import { AlertTriangle, Copy, X } from 'lucide-react';

interface AdminSchemaBannerProps {
  error?: string;
  onDismiss?: () => void;
}

export function AdminSchemaBanner({ error, onDismiss }: AdminSchemaBannerProps) {
  const [copied, setCopied] = useState(false);

  const migrationSQL = `-- Run this SQL in your Supabase SQL editor to fix schema issues
-- This will create all required tables with proper snake_case naming

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  score integer DEFAULT 0,
  progress jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS and policies for players
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read own data" ON players
  FOR SELECT TO authenticated USING (auth_id = auth.uid());

CREATE POLICY "Players can update own data" ON players
  FOR UPDATE TO authenticated USING (auth_id = auth.uid());

CREATE POLICY "Players can insert own data" ON players
  FOR INSERT TO authenticated WITH CHECK (auth_id = auth.uid());

-- Continue with other tables...
-- (Copy the full migration from supabase/migrations/create_board_game_schema.sql)`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(migrationSQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!error || !error.includes('PGRST205')) {
    return null;
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Schema Mismatch Detected
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              The database schema is out of sync. Please run the following SQL in your Supabase SQL editor:
            </p>
          </div>
          <div className="mt-4">
            <div className="bg-gray-900 rounded-md p-4 relative">
              <pre className="text-sm text-gray-100 overflow-x-auto whitespace-pre-wrap">
                {migrationSQL}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md transition-colors"
                title="Copy SQL"
              >
                <Copy className="w-4 h-4" />
              </button>
              {copied && (
                <div className="absolute top-2 right-14 bg-green-600 text-white px-2 py-1 rounded text-xs">
                  Copied!
                </div>
              )}
            </div>
          </div>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onDismiss}
                className="inline-flex bg-red-50 rounded-md p-1.5 text-red-400 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
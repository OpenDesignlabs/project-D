/**
 * Auto-generated Supabase database types.
 * Reflects the `components` and `component_installs` tables exactly.
 * Regenerate with: npx supabase gen types typescript --project-id YOUR_ID > src/lib/database.types.ts
 */

import type {
  ComponentCategory,
  ImportMeta,
  PropDefinition,
} from '../types';

export interface Database {
  public: {
    Tables: {
      components: {
        Row: {
          id: string;
          name: string;
          version: string;
          slug: string;
          label: string;
          description: string;
          category: ComponentCategory;
          tags: string[];
          preview_image_url: string | null;
          preview_code: string | null;
          import_meta: ImportMeta;
          source_code: string;
          default_props: Record<string, unknown>;
          props_schema: PropDefinition[];
          published_by: string;
          is_official: boolean;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
          downloads: number;
          stars: number;
        };
        Insert: Omit<
          Database['public']['Tables']['components']['Row'],
          'id' | 'created_at' | 'updated_at' | 'downloads' | 'stars'
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          downloads?: number;
          stars?: number;
        };
        Update: Partial<Database['public']['Tables']['components']['Row']>;
        Relationships: [];
      };
      component_installs: {
        Row: {
          id: string;
          component_id: string;
          studio_project_id: string;
          installed_at: string;
        };
        Insert: Omit<Database['public']['Tables']['component_installs']['Row'], 'id' | 'installed_at'> & {
          id?: string;
          installed_at?: string;
        };
        Update: Partial<Database['public']['Tables']['component_installs']['Row']>;
        Relationships: [
          {
            foreignKeyName: 'component_installs_component_id_fkey';
            columns: ['component_id'];
            isOneToOne: false;
            referencedRelation: 'components';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_downloads: {
        Args: { component_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

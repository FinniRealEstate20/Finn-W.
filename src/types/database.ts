// Manually-maintained shape of the supabase schema for client typing.
// Once the supabase CLI is hooked up in CI, regenerate with:
//   supabase gen types typescript --linked > src/types/database.ts
// Until then we keep just enough scaffolding for the clients to compile;
// individual queries narrow via `.from('table').select(...)`.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PlanTier = 'starter' | 'pro' | 'business';
export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'inactive';
export type MilestoneStatus = 'pending' | 'in_progress' | 'done' | 'skipped';
export type SubmissionStatusDb = 'draft' | 'submitted' | 'confirmed' | 'failed';
export type PropertyTypeKind =
  | 'ownUse'
  | 'investment-self'
  | 'investment-managed';

export interface Database {
  public: {
    Tables: {
      orgs: {
        Row: {
          id: string;
          name: string;
          owner_user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan_tier: PlanTier | null;
          plan_status: SubscriptionStatus;
          trial_ends_at: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan_tier?: PlanTier | null;
          plan_status?: SubscriptionStatus;
          trial_ends_at?: string | null;
          current_period_end?: string | null;
        };
        Update: Partial<Database['public']['Tables']['orgs']['Insert']>;
        Relationships: [];
      };
      broker_profiles: {
        Row: {
          user_id: string;
          org_id: string;
          full_name: string;
          company: string | null;
          phone: string | null;
          photo_url: string | null;
          brand_color: string | null;
          google_review_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          org_id: string;
          full_name: string;
          company?: string | null;
          phone?: string | null;
          photo_url?: string | null;
          brand_color?: string | null;
          google_review_url?: string | null;
        };
        Update: Partial<Database['public']['Tables']['broker_profiles']['Insert']>;
        Relationships: [];
      };
      invitations: {
        Row: {
          id: string;
          org_id: string;
          code: string;
          label: string | null;
          max_uses: number | null;
          used_count: number;
          expires_at: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          code: string;
          label?: string | null;
          max_uses?: number | null;
          used_count?: number;
          expires_at?: string | null;
          created_by: string;
        };
        Update: Partial<Database['public']['Tables']['invitations']['Insert']>;
        Relationships: [];
      };
      buyer_profiles: {
        Row: {
          user_id: string;
          org_id: string;
          invitation_id: string | null;
          full_name: string;
          email: string;
          phone_enc: string | null;
          birth_date_enc: string | null;
          steuer_id_enc: string | null;
          iban_enc: string | null;
          address_old: Json;
          address_new: Json;
          move_in_date: string | null;
          property_type: PropertyTypeKind | null;
          meter_electricity: string | null;
          meter_gas: string | null;
          onboarded_at: string | null;
          profile_completeness: number;
          key_version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          org_id: string;
          invitation_id?: string | null;
          full_name: string;
          email: string;
          phone_enc?: string | null;
          birth_date_enc?: string | null;
          steuer_id_enc?: string | null;
          iban_enc?: string | null;
          address_old?: Json;
          address_new?: Json;
          move_in_date?: string | null;
          property_type?: PropertyTypeKind | null;
          meter_electricity?: string | null;
          meter_gas?: string | null;
          onboarded_at?: string | null;
          profile_completeness?: number;
          key_version?: number;
        };
        Update: Partial<Database['public']['Tables']['buyer_profiles']['Insert']>;
        Relationships: [];
      };
      buyer_milestones: {
        Row: {
          buyer_id: string;
          milestone_key: string;
          status: MilestoneStatus;
          completed_at: string | null;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          buyer_id: string;
          milestone_key: string;
          status?: MilestoneStatus;
          completed_at?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database['public']['Tables']['buyer_milestones']['Insert']>;
        Relationships: [];
      };
      submissions: {
        Row: {
          id: string;
          buyer_id: string;
          doc_id: string;
          status: SubmissionStatusDb;
          client_receipt_id: string | null;
          server_receipt_id: string | null;
          fill_summary: Json;
          pdf_storage_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          doc_id: string;
          status?: SubmissionStatusDb;
          client_receipt_id?: string | null;
          server_receipt_id?: string | null;
          fill_summary?: Json;
          pdf_storage_path?: string | null;
        };
        Update: Partial<Database['public']['Tables']['submissions']['Insert']>;
        Relationships: [];
      };
      fill_audit_entries: {
        Row: {
          id: string;
          submission_id: string;
          label: string;
          profile_key: string;
          value_redacted: string | null;
          selector: string | null;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          label: string;
          profile_key: string;
          value_redacted?: string | null;
          selector?: string | null;
          source?: string | null;
        };
        Update: Partial<Database['public']['Tables']['fill_audit_entries']['Insert']>;
        Relationships: [];
      };
      recipe_proposals: {
        Row: {
          id: string;
          buyer_id: string | null;
          org_id: string;
          host: string;
          doc_id: string | null;
          proposal: Json;
          status: string;
          reviewed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          buyer_id?: string | null;
          org_id: string;
          host: string;
          doc_id?: string | null;
          proposal: Json;
          status?: string;
          reviewed_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['recipe_proposals']['Insert']>;
        Relationships: [];
      };
      data_export_requests: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          file_storage_path: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: string;
          file_storage_path?: string | null;
        };
        Update: Partial<Database['public']['Tables']['data_export_requests']['Insert']>;
        Relationships: [];
      };
      data_delete_requests: {
        Row: {
          id: string;
          user_id: string;
          reason: string | null;
          status: string;
          requested_at: string;
          scheduled_for: string;
          completed_at: string | null;
          canceled_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          reason?: string | null;
          status?: string;
          scheduled_for?: string;
        };
        Update: Partial<Database['public']['Tables']['data_delete_requests']['Insert']>;
        Relationships: [];
      };
      rate_limits: {
        Row: { key: string; count: number; window_start: string };
        Insert: { key: string; count?: number; window_start?: string };
        Update: Partial<Database['public']['Tables']['rate_limits']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_broker_org: { Args: Record<string, never>; Returns: string | null };
      current_buyer_org: { Args: Record<string, never>; Returns: string | null };
      validate_invitation: {
        Args: { code_input: string };
        Returns: { invitation_id: string; org_id: string; valid: boolean }[];
      };
    };
    Enums: {
      plan_tier: PlanTier;
      subscription_status: SubscriptionStatus;
      milestone_status: MilestoneStatus;
      submission_status: SubmissionStatusDb;
      property_type_kind: PropertyTypeKind;
    };
  };
}

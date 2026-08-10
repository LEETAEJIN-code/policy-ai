export interface Policy {
  id: string;

  title: string;

  organization?: string | null;

  description?: string | null;

  source: string;

  regions: string[];

  targets: string[];

  support_types: string[];

  start_date?: string | null;

  end_date?: string | null;

  detail_url?: string | null;

  original_url?: string | null;
}
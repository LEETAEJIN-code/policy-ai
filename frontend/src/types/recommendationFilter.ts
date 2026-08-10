export type RecommendationFilter =
  | "all"
  | "available"
  | "check_required"
  | "deadline_approaching";

export interface RecommendationFilterCount {
  all: number;
  available: number;
  checkRequired: number;
  deadlineApproaching: number;
}
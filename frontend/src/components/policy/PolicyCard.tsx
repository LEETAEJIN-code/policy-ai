import { Link } from "react-router-dom";

import type { Policy } from "../../types/policy";
import BookmarkButton from "../common/BookmarkButton";

interface PolicyCardProps {
  policy: Policy;
}

export default function PolicyCard({
  policy,
}: PolicyCardProps) {
  return (
    <article className="policy-card">
      <div className="policy-card-top">
        <span className="policy-source">
          {policy.source}
        </span>

        <span className="policy-date">
          {policy.end_date
            ? `${policy.end_date} 마감`
            : "마감일 확인 필요"}
        </span>
      </div>

      <h3 className="policy-card-title">
        {policy.title}
      </h3>

      <p className="policy-organization">
        {policy.organization || "기관 정보 없음"}
      </p>

      <p className="policy-description">
        {policy.description ||
          "공고 설명이 제공되지 않았습니다."}
      </p>

      <div className="policy-tags">
        {(policy.targets ?? [])
          .slice(0, 2)
          .map((target) => (
            <span key={`target-${target}`}>
              {target}
            </span>
          ))}

        {(policy.regions ?? [])
          .slice(0, 2)
          .map((region) => (
            <span key={`region-${region}`}>
              {region}
            </span>
          ))}
      </div>

      <div className="policy-card-actions">
        <Link
          className="card-action-button card-action-primary"
          to={`/policies/${encodeURIComponent(policy.id)}`}
        >
          상세보기
        </Link>

        {policy.detail_url && (
          <a
            className="card-action-button card-action-secondary"
            href={policy.detail_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            원문보기
          </a>
        )}

        <BookmarkButton policyId={policy.id} />
      </div>
    </article>
  );
}
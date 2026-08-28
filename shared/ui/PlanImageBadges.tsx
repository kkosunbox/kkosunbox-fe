interface PlanImageBadge {
  id: number;
  name: string;
  bgColor: string;
  textColor: string;
}

interface PlanImageBadgesProps {
  tags: readonly PlanImageBadge[] | null | undefined;
  className: string;
}

export default function PlanImageBadges({ tags, className }: PlanImageBadgesProps) {
  const visibleTags = (tags ?? []).filter((tag) => tag.name.trim().length > 0);
  if (visibleTags.length === 0) return null;

  return (
    <div className={className}>
      {visibleTags.map((tag) => (
        <span
          key={tag.id}
          className="rounded-[5px] px-1.5 py-1 text-[12px] font-semibold leading-[14px]"
          style={{ background: tag.bgColor, color: tag.textColor }}
        >
          {tag.name}
        </span>
      ))}
    </div>
  );
}

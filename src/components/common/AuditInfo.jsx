import React from "react";

function formatAuditDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const day = String(d.getDate()).padStart(2, "0");
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${day} ${month} ${year} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
}

function getAuditActorName(actor) {
  if (actor === null || actor === undefined) return "";

  if (typeof actor === "object") {
    const candidate =
      actor.name ||
      actor.full_name ||
      actor.user_name ||
      actor.username ||
      actor.display_name ||
      "";
    return String(candidate).trim();
  }

  return String(actor).trim();
}

export default function AuditInfo({
  createdOn,
  updatedOn,
  createdBy,
  updatedBy,
  className = "",
}) {
  const createdTextDate = formatAuditDate(createdOn);
  const updatedTextDate = formatAuditDate(updatedOn);
  const createdActorName = getAuditActorName(createdBy);
  const updatedActorName = getAuditActorName(updatedBy);

  const showCreated = Boolean(createdTextDate);
  const showUpdated = Boolean(updatedTextDate);

  if (!showCreated && !showUpdated) return null;

  return (
    <div
      className={[
        "mt-5 pt-3 border-t border-gray-200 text-[13px] text-gray-500",
        "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        className,
      ].join(" ")}
    >
      {showCreated ? (
        <span title={createdOn ? String(createdOn) : ""}>
          {createdActorName
            ? `Created By ${createdActorName} On ${createdTextDate}`
            : `Created On ${createdTextDate}`}
        </span>
      ) : (
        <span />
      )}

      {showUpdated ? (
        <span title={updatedOn ? String(updatedOn) : ""}>
          {updatedActorName
            ? `Updated By ${updatedActorName} On ${updatedTextDate}`
            : `Updated On ${updatedTextDate}`}
        </span>
      ) : null}
    </div>
  );
}


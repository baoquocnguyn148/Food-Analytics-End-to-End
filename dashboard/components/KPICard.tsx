import React from "react";

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: number;
}

export function KPICard({
  label,
  value,
  unit = "",
  icon,
  trend,
}: KPICardProps) {
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {value}
            {unit && <span className="text-lg text-slate-500 ml-1">{unit}</span>}
          </p>
          {trend !== undefined && (
            <p
              className={`text-sm font-medium mt-2 ${
                trend >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% from last period
            </p>
          )}
        </div>
        {icon && <div className="text-blue-500 text-2xl ml-4">{icon}</div>}
      </div>
    </div>
  );
}

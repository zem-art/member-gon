import { getIcon, type IconLibrary } from "./icon";

type IconRendererProps = {
  lib?: IconLibrary,// ubah jadi optional ✅
  name: string;
  size?: number;
  className?: string;
};

export const IconRenderer = ({
  lib = "lu", // default lib
  name,
  size = 24,
  className = "",
}: IconRendererProps) => {
  const Icon = getIcon({ lib, name });

  if (!Icon) return <span className="text-main">Icon not found</span>;

  return <Icon size={size} className={className} />;
};

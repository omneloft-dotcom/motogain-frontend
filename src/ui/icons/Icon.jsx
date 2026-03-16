import { ICONS } from "./index";

export function Icon({ name, size = 20, className = "", ...rest }) {
  const Component = ICONS[name];
  if (!Component) return null;
  return <Component size={size} className={className} {...rest} />;
}





export default function Card({ children, className = "", tone = "", as: Component = "section", ...props }) {
  return (
    <Component className={`card ${tone ? `card--${tone}` : ""} ${className}`} {...props}>
      {children}
    </Component>
  );
}

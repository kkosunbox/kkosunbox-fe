interface CheckCircleIconProps {
  color: string;
  className?: string;
}

export default function CheckCircleIcon({ color, className = "shrink-0" }: CheckCircleIconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 2C9.4863 2 10.8455 2.54146 11.8936 3.43652L7.20117 8.65137L5.2666 7.19922C4.82485 6.86826 4.19751 6.95786 3.86621 7.39941C3.53493 7.84112 3.62489 8.46836 4.06641 8.7998L6.00098 10.251C6.82933 10.8722 7.99581 10.7589 8.68848 9.98926L13.1885 4.9873C13.7038 5.87283 14 6.90163 14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2Z"
        fill={color}
      />
    </svg>
  );
}

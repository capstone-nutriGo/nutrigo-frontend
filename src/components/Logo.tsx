interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const dimensions = {
    sm: { fontSize: 24, iconSize: 28 },
    md: { fontSize: 28, iconSize: 32 },
    lg: { fontSize: 36, iconSize: 40 }
  };

  const { fontSize, iconSize } = dimensions[size];

  return (
    <div className="flex items-center gap-2">
      {/* 잎사귀 아이콘 */}
      <div 
        className="relative flex items-center justify-center"
        style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
      >
        <svg 
          width={iconSize} 
          height={iconSize} 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 잎사귀 모양 */}
          <path
            d="M16 4C16 4 8 8 8 16C8 20 10 24 16 28C22 24 24 20 24 16C24 8 16 4 16 4Z"
            fill="#7a9b76"
          />
          <path
            d="M16 4C16 4 8 8 8 16C8 20 10 24 16 28C22 24 24 20 24 16C24 8 16 4 16 4Z"
            fill="url(#leafGradient)"
          />
          {/* 잎맥 */}
          <path
            d="M16 8C16 8 12 12 12 16C12 18 13 20 16 22"
            stroke="#b8a67d"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
          <defs>
            <linearGradient id="leafGradient" x1="16" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7a9b76" />
              <stop offset="100%" stopColor="#b8a67d" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {/* 텍스트 로고 */}
      {showText && (
        <span 
          className="font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent"
          style={{ fontSize: `${fontSize}px` }}
        >
          nutriGo
        </span>
      )}
    </div>
  );
}
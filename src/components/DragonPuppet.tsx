import { useId } from 'react'

interface DragonPuppetProps {
  /**
   * Visual evolution stage for pets (0 = hatchling).
   * Flying dragons leave this at 0.
   */
  coolness?: number
  className?: string
}

/** Shoulder pivot in viewBox units — must match CSS transform-origin */
const SHOULDER = { x: 168, y: 70 }

type Point = readonly [number, number]

/**
 * Finger tip from shoulder.
 * angleDeg: 0 = straight up (perpendicular to body),
 *   positive = toward head, negative = toward tail.
 */
function fingerTip(angleDeg: number, length: number): Point {
  const rad = (angleDeg * Math.PI) / 180
  return [
    SHOULDER.x + Math.sin(rad) * length,
    SHOULDER.y - Math.cos(rad) * length,
  ]
}

/**
 * Bat wing built from shared finger tips.
 * Each panel+bone is its own segment so the leading edge can lead the flap
 * and the trailing edge follows (articulated cascade).
 */
function Wing({
  tips,
  armpit,
  fill,
  strokeWidth,
  opacity = 1,
  className,
  cool,
}: {
  tips: Point[]
  armpit: Point
  fill: string
  strokeWidth: number
  opacity?: number
  className: string
  cool: number
}) {
  const { x: sx, y: sy } = SHOULDER
  const edgeTips = [...tips, armpit]
  const origin = { transformOrigin: `${sx}px ${sy}px` }

  const [leadX, leadY] = tips[0]!
  const midX = (sx + leadX) / 2
  const midY = (sy + leadY) / 2

  return (
    <g className={className} opacity={opacity}>
      {edgeTips.slice(0, -1).map((_, i) => {
        const [ax, ay] = edgeTips[i]!
        const [bx, by] = edgeTips[i + 1]!
        const isLeading = i === 0
        const bone = `M${sx} ${sy} L${ax} ${ay}`
        const boneExtra =
          i === edgeTips.length - 2 ? ` M${sx} ${sy} L${bx} ${by}` : ''

        return (
          <g
            key={i}
            className={`puppet-wing-seg puppet-wing-seg--${i}`}
            style={origin}
          >
            <path fill={fill} d={`M${sx} ${sy} L${ax} ${ay} L${bx} ${by} Z`} />
            <path
              className="stroke-bone"
              d={`${bone}${boneExtra}`}
              fill="none"
              strokeWidth={isLeading ? strokeWidth + 0.6 : strokeWidth - i * 0.25}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {isLeading && (
              <>
                <path
                  className="fill-silhouette"
                  d={`M${leadX} ${leadY} L${leadX + 4} ${leadY - 6} L${leadX + 6} ${leadY + 2} Z`}
                />
                <path
                  className="fill-silhouette"
                  d={`M${midX} ${midY} L${midX - 4} ${midY - 8} L${midX + 5} ${midY - 2} Z`}
                />
                {cool >= 3 && (
                  <path
                    className="fill-ember"
                    d={`M${midX} ${midY} L${(midX + leadX) / 2} ${(midY + leadY) / 2 - 6} L${midX + 2} ${midY + 4}`}
                    opacity="0.65"
                  />
                )}
                {cool >= 6 && (
                  <circle
                    className="fill-ember"
                    cx={(midX + leadX) / 2}
                    cy={(midY + leadY) / 2}
                    r="2.2"
                    opacity="0.8"
                  />
                )}
              </>
            )}
          </g>
        )
      })}
    </g>
  )
}

/**
 * Layered SVG dragon puppet modeled on the fire-wyvern sprite sheet.
 * `coolness` unlocks features and grows wing span for pet evolution.
 */
export function DragonPuppet({ coolness = 0, className = '' }: DragonPuppetProps) {
  const cool = Math.min(8, Math.max(0, coolness))
  const uid = useId().replace(/:/g, '')
  const gHot = `mem-hot-${uid}`
  const gDim = `mem-dim-${uid}`
  const gAura = `aura-${uid}`

  // Wings grow with level; higher pets get a longer leading finger
  const wingGrow = 1 + cool * 0.055
  const frontTips: Point[] = [
    fingerTip(4, 70 * wingGrow),
    fingerTip(-20, 54 * wingGrow),
    fingerTip(-42, 38 * wingGrow),
    fingerTip(-58, 24 * wingGrow),
  ]
  const backTips: Point[] = [
    fingerTip(2, 62 * wingGrow),
    fingerTip(-18, 48 * wingGrow),
    fingerTip(-40, 34 * wingGrow),
    fingerTip(-56, 22 * wingGrow),
  ]

  const eyeR = 1.2 + cool * 0.12
  const glowR = 2 + cool * 0.22

  return (
    <svg
      viewBox="0 0 280 130"
      className={`dragon-puppet dragon-puppet--cool${cool} ${className}`.trim()}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gHot} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="var(--dragon-membrane-hot)" />
          <stop offset="45%" stopColor="var(--dragon-membrane-mid)" />
          <stop offset="100%" stopColor="var(--dragon-membrane-edge)" />
        </linearGradient>
        <linearGradient id={gDim} x1="15%" y1="5%" x2="85%" y2="95%">
          <stop offset="0%" stopColor="var(--dragon-membrane-mid)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--dragon-membrane-edge)" stopOpacity="0.65" />
        </linearGradient>
        <radialGradient id={gAura} cx="55%" cy="55%" r="50%">
          <stop offset="0%" stopColor="var(--dragon-membrane-hot)" stopOpacity="0.55" />
          <stop offset="70%" stopColor="var(--dragon-body)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--dragon-body)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Aura behind everything — unlocks mid levels */}
      {cool >= 4 && (
        <ellipse
          className="puppet-aura"
          cx="150"
          cy="72"
          rx={55 + cool * 4}
          ry={28 + cool * 2}
          fill={`url(#${gAura})`}
        />
      )}

      <Wing
        className="puppet-wing puppet-wing--back"
        tips={backTips}
        armpit={fingerTip(-82, 14 * wingGrow)}
        fill={`url(#${gDim})`}
        strokeWidth={2.1}
        opacity={0.85}
        cool={cool}
      />

      <g className="puppet-tail">
        <path
          className="fill-silhouette"
          d="M118 68
             C98 66 72 68 50 70
             C32 71 18 72 10 72
             C10 72 18 74 32 75
             C50 76 72 78 98 78
             C108 78 116 76 118 74
             Z"
        />
        <path className="fill-silhouette" d="M12 72 L2 64 L0 72 L2 80 Z" />
        <path fill={`url(#${gHot})`} d="M12 72 L2 64 L5 72 Z" opacity="0.75" />
        <path fill={`url(#${gHot})`} d="M12 72 L2 80 L5 72 Z" opacity="0.75" />
        {/* Bigger fluke at high levels */}
        {cool >= 5 && (
          <path
            fill={`url(#${gHot})`}
            d="M14 72 L0 60 L-4 72 L0 84 Z"
            opacity="0.55"
          />
        )}
        <path
          className="stroke-ridge"
          d="M110 68 L106 60 L104 70
             M92 69 L88 61 L86 71
             M74 70 L70 62 L68 72
             M56 71 L52 63 L50 73
             M40 71 L36 64 L34 73
             M26 72 L22 65 L20 74
             M16 72 L12 66 L10 74"
          fill="none"
          strokeWidth={1.4 + cool * 0.08}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {cool >= 2 && (
          <path
            className="stroke-ridge"
            d="M100 68 L97 58 L95 70 M82 69 L79 59 L77 71 M64 70 L61 61 L59 72"
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        )}
      </g>

      <g className="puppet-legs">
        <path className="fill-silhouette" d="M126 76 L106 80 L102 84 L110 82 L128 78 Z" />
        <path className="fill-silhouette" d="M136 78 L118 84 L114 88 L124 86 L138 80 Z" />
        <path
          className="stroke-bone"
          d="M106 80 L94 82 M102 84 L90 86 M118 84 L106 88 M114 88 L102 92"
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {cool >= 3 && (
          <path
            className="stroke-bone"
            d="M94 82 L88 78 M90 86 L84 84 M106 88 L100 84 M102 92 L96 90"
            fill="none"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        )}
      </g>

      <g className="puppet-body">
        <path
          className="fill-silhouette"
          d="M178 66
             C170 60 156 58 140 62
             C128 64 120 68 116 70
             C114 72 114 74 116 74
             C122 78 136 82 152 82
             C166 82 176 80 180 76
             C184 74 184 70 178 66
             Z"
        />
        <path
          className="fill-highlight"
          d="M170 74
             C158 76 142 78 128 76
             C142 74 158 72 170 72
             Z"
          opacity={0.35 + cool * 0.04}
        />
        <path
          className="stroke-ridge"
          d="M174 64 L170 56 L168 66
             M160 62 L156 54 L154 64
             M146 62 L142 54 L140 64
             M132 64 L128 58 L126 66"
          fill="none"
          strokeWidth={1.6 + cool * 0.1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {cool >= 1 && (
          <path
            className="stroke-ridge"
            d="M170 62 L167 52 L165 64 M152 60 L149 50 L147 62"
            fill="none"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        )}
        {cool >= 2 && (
          <>
            <ellipse className="fill-ember" cx="164" cy="76" rx="1.8" ry="1.2" />
            <ellipse className="fill-ember" cx="148" cy="76" rx="1.6" ry="1.1" />
            <ellipse className="fill-ember" cx="132" cy="74" rx="1.3" ry="0.9" />
          </>
        )}
        {cool >= 5 && (
          <>
            <ellipse className="fill-ember" cx="170" cy="74" rx="2.2" ry="1.5" />
            <ellipse className="fill-ember" cx="156" cy="78" rx="2" ry="1.3" />
            <ellipse className="fill-ember" cx="140" cy="76" rx="1.7" ry="1.1" />
          </>
        )}
        {cool >= 7 && (
          <path
            className="fill-ember"
            d="M172 68 L168 60 L174 66 M158 66 L154 56 L162 64 M144 66 L140 58 L148 64"
            opacity="0.85"
          />
        )}
      </g>

      <g className="puppet-neck">
        <path
          className="fill-silhouette"
          d="M176 70
             C184 68 190 68 196 70
             C196 76 192 78 186 78
             C180 78 176 76 176 70
             Z"
        />
        {cool >= 2 && (
          <path className="fill-ember" d="M186 72 L188 68 L190 74" opacity="0.7" />
        )}
        {cool >= 4 && (
          <path
            className="fill-ember"
            d="M182 74 L184 70 L186 76 M190 74 L192 69 L194 76"
            opacity="0.8"
          />
        )}
      </g>

      <g className="puppet-head">
        <path
          className="fill-silhouette"
          d="M194 70
             L204 66 L218 70 L224 74 L216 78 L206 78
             L198 80 L194 76
             Z"
        />
        <path className="fill-mouth" d="M214 74 L222 73 L216 77 Z" />
        {/* Base horns */}
        <path className="fill-silhouette" d="M198 66 L194 58 L202 66 Z" />
        <path className="fill-silhouette" d="M206 64 L204 54 L210 66 Z" />
        {/* Lv1+: glowing crest */}
        {cool >= 1 && (
          <path className="fill-ember" d="M210 64 L212 50 L214 66 Z" opacity="0.9" />
        )}
        {/* Lv3+: crown horn */}
        {cool >= 3 && (
          <path className="fill-ember" d="M216 62 L220 46 L222 64 Z" opacity="0.85" />
        )}
        {/* Lv4+: jaw spike */}
        {cool >= 4 && (
          <path className="fill-silhouette" d="M196 72 L186 62 L198 72 Z" />
        )}
        {/* Lv6+: twin back-swept horns */}
        {cool >= 6 && (
          <>
            <path className="fill-silhouette" d="M200 62 L192 48 L204 64 Z" />
            <path className="fill-ember" d="M208 58 L204 42 L212 60 Z" opacity="0.9" />
          </>
        )}
        {/* Lv8+: regal third crest */}
        {cool >= 8 && (
          <path className="fill-ember" d="M214 56 L218 38 L222 58 Z" opacity="0.95" />
        )}
        <circle className="fill-eye-glow" cx="212" cy="70" r={glowR} />
        <circle className="fill-eye" cx="212" cy="70" r={eyeR} />
        <circle className="fill-pupil" cx={212.5 + cool * 0.05} cy="70" r={0.5 + cool * 0.04} />
        {/* Lv5+: breath flame */}
        {cool >= 5 && (
          <path className="fill-mouth" d="M222 70 L238 66 L228 78 Z" opacity="0.85" />
        )}
        {/* Lv7+: bigger breath */}
        {cool >= 7 && (
          <path className="fill-ember" d="M226 68 L248 62 L234 80 Z" opacity="0.7" />
        )}
      </g>

      <Wing
        className="puppet-wing puppet-wing--front"
        tips={frontTips}
        armpit={fingerTip(-82, 14 * wingGrow)}
        fill={`url(#${gHot})`}
        strokeWidth={2.6 + cool * 0.08}
        cool={cool}
      />
    </svg>
  )
}

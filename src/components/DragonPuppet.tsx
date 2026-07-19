import { useId } from 'react'

interface DragonPuppetProps {
  /** 0–5 visual complexity for pets / flair */
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
        // Bone along the leading edge of this panel (and trailing bone on last)
        const bone =
          i < tips.length
            ? `M${sx} ${sy} L${ax} ${ay}`
            : `M${sx} ${sy} L${ax} ${ay}`
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
 * Horizontal spine; both wings share finger geometry and flap in phase.
 */
export function DragonPuppet({ coolness = 0, className = '' }: DragonPuppetProps) {
  const cool = Math.min(5, Math.max(0, coolness))
  const uid = useId().replace(/:/g, '')
  const gHot = `mem-hot-${uid}`
  const gDim = `mem-dim-${uid}`

  // Fingers fan up from the shoulder (Z-flap mirrors them straight down).
  // Largest / longest nearest the head, then each shorter aft.
  // angle 0 = perpendicular to body; + toward head, − toward tail.
  const frontTips: Point[] = [
    fingerTip(4, 70), // largest — head-side leading edge
    fingerTip(-20, 54),
    fingerTip(-42, 38),
    fingerTip(-58, 24), // smallest — trailing
  ]
  const backTips: Point[] = [
    fingerTip(2, 62),
    fingerTip(-18, 48),
    fingerTip(-40, 34),
    fingerTip(-56, 22),
  ]

  return (
    <svg
      viewBox="0 0 280 130"
      className={`dragon-puppet ${className}`.trim()}
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
      </defs>

      <Wing
        className="puppet-wing puppet-wing--back"
        tips={backTips}
        armpit={fingerTip(-82, 14)}
        fill={`url(#${gDim})`}
        strokeWidth={2.1}
        opacity={0.85}
        cool={cool}
      />

      {/*
        Body + tail from the sprite sheet:
        thick chest at the wing root → smooth taper into a long slender whip →
        small diamond/spade fluke.
      */}
      <g className="puppet-tail">
        {/* Long whip — half the dragon's length, slender, continuous taper */}
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
        {/* Spade / fluke — wider than the whip tip, like the reference */}
        <path className="fill-silhouette" d="M12 72 L2 64 L0 72 L2 80 Z" />
        <path
          fill={`url(#${gHot})`}
          d="M12 72 L2 64 L5 72 Z"
          opacity="0.75"
        />
        <path
          fill={`url(#${gHot})`}
          d="M12 72 L2 80 L5 72 Z"
          opacity="0.75"
        />
        {/* Spines along the whip */}
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
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Hind legs tucked back against the hip / tail base */}
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
      </g>

      {/* Chest / torso — thickest at wing root, narrows into the whip */}
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
        {/* Belly magma glow */}
        <path
          className="fill-highlight"
          d="M170 74
             C158 76 142 78 128 76
             C142 74 158 72 170 72
             Z"
          opacity="0.45"
        />
        {/* Dorsal spines on chest */}
        <path
          className="stroke-ridge"
          d="M174 64 L170 56 L168 66
             M160 62 L156 54 L154 64
             M146 62 L142 54 L140 64
             M132 64 L128 58 L126 66"
          fill="none"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {cool >= 2 && (
          <>
            <ellipse className="fill-ember" cx="164" cy="76" rx="1.8" ry="1.2" />
            <ellipse className="fill-ember" cx="148" cy="76" rx="1.6" ry="1.1" />
            <ellipse className="fill-ember" cx="132" cy="74" rx="1.3" ry="0.9" />
          </>
        )}
      </g>

      {/* Short neck */}
      <g className="puppet-neck">
        <path
          className="fill-silhouette"
          d="M176 70
             C184 68 190 68 196 70
             C196 76 192 78 186 78
             C180 78 176 76 176 70
             Z"
        />
        {cool >= 3 && (
          <path className="fill-ember" d="M186 72 L188 68 L190 74" opacity="0.7" />
        )}
      </g>

      {/* Tiny head */}
      <g className="puppet-head">
        <path
          className="fill-silhouette"
          d="M194 70
             L204 66 L218 70 L224 74 L216 78 L206 78
             L198 80 L194 76
             Z"
        />
        <path className="fill-mouth" d="M214 74 L222 73 L216 77 Z" />
        <path className="fill-silhouette" d="M198 66 L194 58 L202 66 Z" />
        <path className="fill-silhouette" d="M206 64 L204 54 L210 66 Z" />
        {cool >= 1 && <path className="fill-ember" d="M210 64 L212 52 L214 66 Z" opacity="0.85" />}
        {cool >= 4 && <path className="fill-silhouette" d="M196 72 L188 64 L198 72 Z" />}
        <circle className="fill-eye-glow" cx="212" cy="70" r="2" />
        <circle className="fill-eye" cx="212" cy="70" r="1.2" />
        <circle className="fill-pupil" cx="212.5" cy="70" r="0.5" />
        {cool >= 5 && <path className="fill-mouth" d="M220 68 L232 64 L224 76 Z" opacity="0.75" />}
      </g>

      <Wing
        className="puppet-wing puppet-wing--front"
        tips={frontTips}
        armpit={fingerTip(-82, 14)}
        fill={`url(#${gHot})`}
        strokeWidth={2.6}
        cool={cool}
      />
    </svg>
  )
}

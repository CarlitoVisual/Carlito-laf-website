"use client"

import dynamic from "next/dynamic"

// VideoIntro uses browser APIs (scroll, touch) — only load client-side
const VideoIntro = dynamic(() => import("./VideoIntro"), { ssr: false })

type Props = {
  videoUrl: string
  posterUrl?: string
  title?: string
  subtitle?: string
}

export default function VideoIntroWrapper(props: Props) {
  return <VideoIntro {...props} />
}

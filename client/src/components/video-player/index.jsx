import { useCallback, useEffect, useRef, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import {
    Play,
    Pause,
    Maximize,
    Minimize,
    RotateCcw,
    RotateCw,
    Volume2,
    VolumeX,
    ArrowLeft,
    ArrowRight,
    ArrowUpDownIcon,
    PictureInPicture,
    PictureInPicture2,
    StepForward,
    StepBack,
    Volume1
} from "lucide-react"
import ReactPlayer from "react-player"


function VideoPlayer({ url, videoId, onProgressUpdate, progressData, width = '100%', height = '100%' }) {
    const [played, setPlayed] = useState(0)
    const [volume, setVolume] = useState(1)
    const [prevVolume, setPrevVolume] = useState(volume)
    const [muted, setMuted] = useState(false)
    const [playing, setPlaying] = useState(false)
    const [seeking, setSeeking] = useState(false)
    const [fullScreen, setFullScreen] = useState(false)
    const [showControls, setShowControls] = useState(false)
    const [holdControls, setHoldControls] = useState(false)
    const [showLayer, setShowLayer] = useState(true)
    const [isFocused, setIsFocused] = useState(true)
    const [hasAudio, setHasAudio] = useState(true)
    const [isPip, setIsPip] = useState(false)
    const [isPipAvailable, setIsPipAvailable] = useState(false)
    const [showIndication, setShowIndication] = useState(false)
    const [showForward, setShowForward] = useState(false)
    const [showBackward, setShowBackward] = useState(false)
    const [showVolume, setShowVolume] = useState(false)
    const [duration, setDuration] = useState(null)
    const playerContainerRef = useRef(null)
    const controlsTimeoutRef = useRef(null)
    const timeoutRef = useRef(null)
    const playerRef = useRef(null)
    const isReadyRef = useRef(false)

    const handleFullScreen = useCallback(async () => {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture()
            setIsPip(false)
        }
        if (!fullScreen) {
            if (playerContainerRef?.current?.requestFullscreen) {
                playerContainerRef?.current?.requestFullscreen()
            }
        } else if (document.exitFullscreen) {
            document.exitFullscreen()
        }
    }, [fullScreen])

    const handlePlayAndPause = useCallback(() => {
        if (played === 1) {
            setPlayed(0)
        }
        setPlaying(!playing)
        setShowControls(playing && !showControls)
    }, [played, playing, showControls])

    const handleBackward = useCallback(() => {
        const player = playerRef.current
        if (player) player.seekTo(player.getCurrentTime() - 5)
        if ((!showLayer && showIndication) || showBackward) return
        
        setShowIndication(true)
        setShowBackward(true)

        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        timeoutRef.current = setTimeout(() => {
            setShowIndication(false)
            setShowBackward(false)
            timeoutRef.current = null
        }, 1000)
    }, [showIndication, showBackward])

    const handleForward = useCallback(() => {
        const player = playerRef.current
        if (player) player.seekTo(player.getCurrentTime() + 5)
        if ((!showLayer && showIndication) || showForward) return

        setShowIndication(true)
        setShowForward(true)

        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        timeoutRef.current = setTimeout(() => {
            setShowIndication(false)
            setShowForward(false)
            timeoutRef.current = null
        }, 1000)
    }, [showIndication, showForward])

    const handleShowVolume = useCallback(() => {
        if ((!showLayer && showIndication) || showVolume) return

        setShowIndication(true)
        setShowVolume(true)

        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        timeoutRef.current = setTimeout(() => {
            setShowIndication(false)
            setShowVolume(false)
            timeoutRef.current = null
        }, 1000)
    }, [showIndication, showVolume])

    function handleReady() {
        const player = playerRef.current.getInternalPlayer()

        if (player && !isReadyRef.current) {
            const video = player instanceof HTMLVideoElement ? player : null
            if (video) {
                const hasAudioTracks =
                    video.mozHasAudio ||
                    Boolean(video.webkitAudioDecodedByteCount) ||
                    Boolean(video.audioTracks && video.audioTracks.length)

                setHasAudio(hasAudioTracks)

                if (!hasAudioTracks) {
                    setMuted(true)
                    setVolume(0)
                } else {
                    setMuted(false)
                    setVolume(1)
                }

                isReadyRef.current = true
            }
        }
    }

    function handleMouseMove() {
        setShowControls(true)
        const videoPlayers = document.querySelectorAll('.video-player')
        videoPlayers.forEach(x => { x.style.setProperty('cursor', 'auto', 'important') })
        clearTimeout(controlsTimeoutRef.current)
        controlsTimeoutRef.current = setTimeout(() => {
            if (playing && !holdControls) {
                videoPlayers.forEach(x => { x.style.setProperty('cursor', 'none', 'important') })
                setShowControls(false)
            }
        }, 2000)
    }

    function handleMouseLeave() {
        const videoPlayers = document.querySelectorAll('.video-player')
        videoPlayers.forEach(x => { x.style.setProperty('cursor', 'auto', 'important') })
        clearTimeout(controlsTimeoutRef.current)
        if (playing) {
            setShowControls(false)
        }
    }

    function handleMute() {
        if (muted) {
            setMuted(false)
            setVolume(prevVolume)
        } else {
            setPrevVolume(volume)
            setMuted(true)
            setVolume(0)
        }
        setTimeout(handleShowVolume, 0)
    }

    function handleVolumeChange(value) {
        const newVolume = value[0]
        setVolume(newVolume)

        if (newVolume === 0) {
            setMuted(true)
        } else {
            setMuted(false)
        }
        setTimeout(handleShowVolume, 0)
    }

    function handleProgress(state) {
        if (!seeking) {
            setPlayed(state.played)
        }

        if (played === 1) {
            setPlayed(1)
        }
    }

    function handleSeekChange(value) {
        setPlayed(value[0])
        setSeeking(true)
    }

    function handleSeekHover() {
        playerRef.current?.seekTo(played)
        setSeeking(false)
    }

    function handleEnded() {
        setPlaying(false)
        setPlayed(1)
    }

    function timeFormat(seconds) {
        const padStart = (num) => ('0' + num).slice(-2)

        const date = new Date(seconds * 1000)
        const hh = date.getUTCHours()
        const mm = date.getUTCMinutes()
        const ss = padStart(date.getUTCSeconds())

        if (hh > 0) {
            return `${hh}:${padStart(mm)}:${ss}`
        }
        return `${mm}:${ss}`
    }

    async function handlePictureInPicture() {
        if (!document.pictureInPictureEnabled) return

        if (playerRef.current) {
            const videoElement = playerRef.current.getInternalPlayer()

            if (videoElement) {
                try {
                    if (!isPip) {
                        await videoElement.requestPictureInPicture()
                        setIsPip(true)
                    } else if (document.pictureInPictureElement) {
                        await document.exitPictureInPicture()
                        setIsPip(false)
                    }
                } catch (error) {
                    console.error('PiP error:', error)
                }
            }
        }
    }

    useEffect(() => {
        const checkPiPSupport = () => {
            if (document.pictureInPictureEnabled && playerRef.current) {
                const videoElement = playerRef.current.getInternalPlayer()
                if (videoElement && typeof videoElement.requestPictureInPicture === 'function') {
                    setIsPipAvailable(true)
                }
            }
        }

        checkPiPSupport()
        const timeoutId = setTimeout(checkPiPSupport, 1000)
        return () => clearTimeout(timeoutId)
    }, [playerRef.current])

    useEffect(() => {
        const interval = setInterval(() => {
            if (playerRef.current) {
                const videoDuration = playerRef.current.getDuration()
                if (videoDuration && videoDuration > 0) {
                    setDuration(videoDuration)
                }
            }
        }, 100)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const handleFullScreenChange = () => {
            setFullScreen(document.fullscreenElement)
        }

        document.addEventListener('fullscreenchange', handleFullScreenChange)

        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange)
        }
    }, [])

    useEffect(() => {
        const player = playerRef.current?.getInternalPlayer()
        if (!player) return

        const handlePlay = () => setPlaying(true)
        const handlePause = () => setPlaying(false)

        player.addEventListener('play', handlePlay)
        player.addEventListener('pause', handlePause)

        return () => {
            player.removeEventListener('play', handlePlay)
            player.removeEventListener('pause', handlePause)
        }
    }, [])

    useEffect(() => {
        if (isFocused) {
            playerContainerRef.current?.focus()
        } else {
            playerContainerRef.current?.blur()
        }
    }, [isFocused])

    useEffect(() => {
        if (progressData !== undefined && played === 1) {
            onProgressUpdate({
                ...progressData,
                progressValue: played
            })
        }
    }, [played])

    useEffect(() => {
        setShowLayer(prev => !playing && (played === 0 || played === 1))
    }, [playing, played])

    useEffect(() => {
        if (played === 1) {
            setPlaying(false)
        }
    }, [played])

    useEffect(() => {
        const videoPlayers = document.querySelectorAll('.video-player')
        videoPlayers.forEach(x => { x.style.setProperty('cursor', 'auto', 'important') })

        if (playing && !holdControls) {
            videoPlayers.forEach(x => { x.style.setProperty('cursor', 'none', 'important') })
            setShowControls(false)
        }
    }, [playing, holdControls])

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!isFocused) return

            if (showLayer && event.code !== 'Space') {
                event.preventDefault()
                event.stopPropagation()
                return
            }

            setShowControls(true)
            clearTimeout(controlsTimeoutRef.current)
            controlsTimeoutRef.current = setTimeout(() => {
                if (playing && !holdControls) {
                    setShowControls(false)
                }
            }, 2000)

            switch (event.code) {
                case 'Space': {
                    handlePlayAndPause()
                    event.preventDefault()
                    break
                }
                case 'ArrowRight': {
                    handleForward()
                    break
                }
                case 'ArrowLeft': {
                    handleBackward()
                    break
                }
                case 'ArrowUp': {
                    event.preventDefault()
                    setVolume((prevVolume) => {
                        let newVolume = Math.min(prevVolume + 0.05, 1)
                        setMuted(newVolume === 0)
                        return newVolume
                    })
                    setTimeout(handleShowVolume, 0)
                    break
                }
                case 'ArrowDown': {
                    event.preventDefault()
                    setVolume((prevVolume) => {
                        let newVolume = Math.max(prevVolume - 0.05, 0)
                        setMuted(newVolume === 0)
                        return newVolume
                    })
                    setTimeout(handleShowVolume, 0)
                    break
                }
                case 'KeyM': {
                    const volumeButton = document.getElementById(videoId !== undefined ? `volume-for-video-${videoId}` : 'volume')
                    if (volumeButton) volumeButton.click()
                    setTimeout(handleShowVolume, 0)
                    break
                }
                case 'KeyP': {
                    const pipButton = document.getElementById(videoId !== undefined ? `pip-for-video-${videoId}` : 'pip')
                    if (pipButton) pipButton.click()
                    break
                }
                case 'KeyF': {
                    handleFullScreen()
                    break
                }
                default:
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isFocused, showLayer, handlePlayAndPause, handleForward, handleBackward, handleFullScreen, handleShowVolume, holdControls, playing])

    return (
        <TooltipProvider>
            <div
                tabIndex={0}
                ref={playerContainerRef}
                style={{ width, height }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onBlur={() => {
                    playerContainerRef.current?.blur()
                    setIsFocused(false)
                }}
                onClick={(event) => {
                    event.stopPropagation()
                    playerContainerRef.current?.focus()
                    setIsFocused(true)
                }}
                className={`${fullScreen ? 'w-screen h-screen' : null}  relative overflow-hidden rounded-md bg-slate-900`}
            >
                <ReactPlayer
                    url={url}
                    muted={muted}
                    volume={volume}
                    ref={playerRef}
                    controls={false}
                    playing={playing}
                    onReady={handleReady}
                    onEnded={handleEnded}
                    onProgress={handleProgress}
                    config={{ file: { attributes: { controlsList: 'nodownload' } } }}
                    className="absolute top-0 left-0"
                    width="100%"
                    height="100%"
                />
                <div
                    onClick={handlePlayAndPause}
                    className={`${showLayer ? "opacity-100 z-50" : "opacity-0 z-0"} absolute bg-black/30 text-white w-full h-full transition-opacity duration-300 cursor-pointer`}
                >
                    { showLayer && (
                        played === 0 ? (
                            <Play className="w-10 h-10 absolute inset-0 m-auto scale-125 hover:scale-150 duration-300" />
                        ) : played === 1 ? (
                            <Play className="w-10 h-10 absolute inset-0 m-auto scale-125 hover:scale-150 duration-300" />
                        ) : null
                    )}
                </div>
                <div className={`${showIndication ? "opacity-100" : "opacity-0"} absolute inset-0 m-auto bg-black/30 text-white w-20 h-20 rounded-full transition-opacity`}>
                    { showForward ? (
                            <StepForward className="w-10 h-10 absolute inset-0 m-auto scale-125" />
                        ) : showBackward ? (
                            <StepBack className="w-10 h-10 absolute inset-0 m-auto scale-125" />
                        ) : null
                    }
                    { showVolume && (
                        muted ? (
                            <VolumeX className="w-10 h-10 absolute inset-0 m-auto scale-125" />
                        ) : volume < 0.5 ? (
                            <Volume1 className="w-10 h-10 absolute inset-0 m-auto scale-125" />
                        ) : (
                            <Volume2 className="w-10 h-10 absolute inset-0 m-auto scale-125" />
                        )
                    )}
                </div>
                <div onClick={handlePlayAndPause} className="absolute bg-transparent w-full h-[calc(100%-4rem)] z-40 video-player"></div>
                <div
                    onMouseEnter={useCallback(() => setHoldControls(true), [])}
                    onMouseLeave={useCallback(() => setHoldControls(false), [])}
                    className={`${showControls || holdControls || !playing ? 'opacity-100' : 'opacity-0'} absolute block bottom-0 left-0 right-0 pb-2 z-40 bg-gray-800 transition-opacity duration-300`}
                >
                    <Slider
                        step={1}
                        max={100}
                        value={[played * 100]}
                        onValueCommit={handleSeekHover}
                        onValueChange={(value) => handleSeekChange([value[0] / 100])}
                        className="mb-2"
                    />
                    <div className="flex items-center justify-between px-3">
                        <div className="flex items-center">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="none"
                                        className="text-white bg-transparent transition ease-in-out hover:scale-125"
                                        onClick={handlePlayAndPause}
                                    >
                                        { playing ? <Pause /> : <Play /> }
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    { playing ? 'Pause' : 'Play' }
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="none"
                                        className="text-white bg-transparent transition ease-in-out hover:scale-125"
                                        onClick={handleBackward}
                                    >
                                        <RotateCcw />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <span className="flex flex-row">
                                        <ArrowLeft size={16} strokeWidth={2.5} className="mr-0.5 mt-[0.5px]" />
                                        Backward
                                    </span>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="none"
                                        className="text-white bg-transparent transition ease-in-out hover:scale-125"
                                        onClick={handleForward}
                                    >
                                        <RotateCw />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <span className="flex flex-row">
                                        Forward
                                        <ArrowRight size={16} strokeWidth={2.5} className="ml-0.5 mt-[0.5px]" />
                                    </span>
                                </TooltipContent>
                            </Tooltip>
                            <div className="relative flex items-center">
                                <div className="group flex items-center">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="none"
                                                className="text-white bg-transparent transition ease-in-out hover:scale-125"
                                                id={`${videoId !== undefined ? `volume-for-video-${videoId}` : 'volume'}`}
                                                onClick={handleMute}
                                                disabled={!hasAudio}
                                            >
                                                { muted || !hasAudio ? <VolumeX /> : volume < 0.5 ? <Volume1 /> : <Volume2 /> }
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            { muted || !hasAudio ? 'Unmute (M)' : 'Mute (M)' }
                                        </TooltipContent>
                                    </Tooltip>
                                    { hasAudio && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="absolute left-full ml-1 w-14 sm:w-20 opacity-0 scale-90 transition group-hover:opacity-100 group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto">
                                                    <Slider
                                                        step={1}
                                                        max={100}
                                                        className="h-10"
                                                        value={[volume * 100]}
                                                        onValueChange={(value) => handleVolumeChange([value[0] / 100])}
                                                    />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <span className="flex flex-row">
                                                    Volume
                                                    (<ArrowUpDownIcon className="w-3.5 h-3.5 mt-0.5" />)
                                                </span>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="text-white mr-2 select-none cursor-default">
                                { timeFormat(played * (duration)) || 0 }
                                {' '} / {' '}
                                { timeFormat(duration) || 0 }
                            </div>
                            { isPipAvailable && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="none"
                                            className="text-white bg-transparent transition ease-in-out hover:scale-125"
                                            id={`${videoId !== undefined ? `pip-for-video-${videoId}` : 'pip'}`}
                                            onClick={handlePictureInPicture}
                                        >
                                            { isPip ? <PictureInPicture /> : <PictureInPicture2 /> }
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        { isPip ? 'Exit Picture-In-Picture (P)' : 'Picture-In-Picture (P)' }
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="none"
                                        className="text-white bg-transparent transition ease-in-out hover:scale-125"
                                        onClick={handleFullScreen}
                                    >
                                        {fullScreen ? <Minimize /> : <Maximize />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    { fullScreen ? 'Exit Full Screen (F)' : 'Full Screen (F)' }
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
}

export default VideoPlayer
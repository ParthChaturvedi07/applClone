import React, { useEffect, useRef, useState } from "react";
import { highlightsSlides } from "../constants";
import { pauseImg, playImg, replayImg } from "../utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export const VideoCarousel = () => {
  const videoRef = useRef([]);
  const videoSpanRef = useRef([]);
  const videoDivRef = useRef([]);

  const [video, setVideo] = useState({
    isEnd: false,
    startPlay: false,
    videoId: 0,
    isLastVideo: false,
    isPlaying: false,
  });

  const [loadedData, setLoadedData] = useState([]);

  const { isEnd, isLastVideo, startPlay, videoId, isPlaying } = video;

  gsap.registerPlugin(ScrollTrigger);

  useGSAP(() => {
    gsap.to("#slider", {
      transform: `translateX(${-100 * videoId}%)`,
      duration: 2,
      ease: "power2.inOut",
    });

    gsap.to("#video", {
      scrollTrigger: {
        trigger: "#video",
        toggleActions: "restart none none none",
      },
      onComplete: () => {
        setVideo((pre) => ({
          ...pre,
          startPlay: true,
          isPlaying: true,
        }));
      },
    });
  }, [isEnd, videoId]);

  useEffect(() => {
    if (loadedData.length > 3) {
      if (!isPlaying) {
        videoRef.current[videoId].pause();
      } else {
        startPlay && videoRef.current[videoId].play();
      }
    }
  }, [startPlay, videoId, isEnd, isPlaying]);

  const handleLoadedMetadata = (i, e) => setLoadedData((pre) => [...pre, e]);

  useEffect(() => {
    let currentProgress = 0;
    let span = videoSpanRef.current;

    if (span[videoId]) {
      //animating the progress of the video

      let anim = gsap.to(span[videoId], {
        onUpdate: () => {
          const progress = Math.ceil(anim.progress() * 100);

          if (progress != currentProgress) {
            currentProgress = progress;

            gsap.to(videoDivRef.current[videoId], {
              width:
                window.innerWidth < 760
                  ? "10vw "
                  : window.innerWidth < 1200
                  ? "10vw"
                  : "4vw",
            });

            gsap.to(span[videoId], {
              width: `${currentProgress}%`,
              backgroundColor: "white",
            });
          }
        },

        onComplete: () => {
          if (isPlaying) {
            gsap.to(videoDivRef.current[videoId], {
              width: "12px",
            });

            gsap,
              to(span[videoId], {
                backgroundColor: "#afafaf",
              });
          }
        },
      });

      if (videoId === 0) {
        anim.restart();
      }

      const animUpdate = () => {
        anim.progress(
          videoRef.current[videoId].currentTime /
            highlightsSlides[videoId].videoDuration
        );
      };

      if (isPlaying) {
        gsap.ticker.add(animUpdate);
      } else {
        gsap.ticker.remove(animUpdate);
      }
    }
  }, [videoId, startPlay]);

  const handleProcess = (type, i) => {
    switch (type) {
      case "video-end":
        setVideo((pre) => ({ ...pre, isEnd: true, videoId: i + 1 }));
        break;

      case "video-last":
        setVideo((pre) => ({ ...pre, isLastVideo: true }));
        break;

      case "video-reset":
        setVideo((pre) => ({ ...pre, videoId: 0, isLastVideo: false }));
        break;

      case "pause":
        setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }));
        break;

      case "play":
        setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }));
        break;

      default:
        return video;
    }
  };
  return (
    <>
      <div className="flex items-center">
        {highlightsSlides.map((list, i) => {
          return (
            <div key={list.id} id="slider" className="sm:pr-20 pr-10">
              <div className="video-carousel_container">
                <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
                  <video
                    id="video"
                    preload="auto"
                    playsInline={true}
                    autoPlay
                    muted
                    className={`${list.id === 2 && "translate-x-44"}
                      pointer-events-none
                    `}
                    ref={(el) => (videoRef.current[i] = el)}
                    onEnded={() => {
                      i !== 3
                        ? handleProcess("video-end", i)
                        : handleProcess("video-last");
                    }}
                    onPlay={() => {
                      setVideo((prevVideo) => ({
                        ...prevVideo,
                        isPlaying: true,
                      }));
                    }}
                    onLoadedMetadata={(e) => handleLoadedMetadata(i, e)}
                  >
                    <source src={list.video} type="video/mp4" />
                  </video>
                </div>
                <div className="absolute top-12 left-[5%] z-10">
                  {list.textLists.map((text) => {
                    return (
                      <p key={text} className="md:text-2xl text-xl font-medium">
                        {text}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="relative flex-center mt-10 ">
        <div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full">
          {videoRef.current.map((_, i) => {
            return (
              <span
                key={i}
                ref={(el) => (videoDivRef.current[i] = el)}
                className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
              >
                <span
                  className="absolute h-full w-full rounded-full"
                  ref={(el) => (videoSpanRef.current[i] = el)}
                ></span>
              </span>
            );
          })}
        </div>
        <button className="control-btn ">
          <img
            src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
            alt={isLastVideo ? "replay" : !isPlaying ? "play" : "pause"}
            onClick={
              isLastVideo
                ? () => handleProcess("video-reset")
                : !isPlaying
                ? () => handleProcess("play")
                : () => handleProcess("pause")
            }
          />
        </button>
      </div>
    </>
  );
};


// The VideoCarousel component is a React component that manages a series of videos in a carousel format with animation and progress tracking. Let’s break down the logic step-by-step.

// 1. Setting Up State and References
// State Variables (video and loadedData):
// video: Holds information about the playback state, including videoId (current video index), isPlaying, isEnd (whether a video has ended), isLastVideo (whether it’s the last video), and startPlay (if the video should start playing).
// loadedData: Keeps track of loaded video metadata to ensure the video can play once enough data is buffered.
// Refs (videoRef, videoSpanRef, videoDivRef):
// videoRef: References each video element.
// videoSpanRef and videoDivRef: Track progress indicators and divs that display playback progress visually.
// 2. Animations with GSAP
// gsap is used to animate the transition between videos and to handle the scroll-triggered animations.
// Scroll Trigger: Uses ScrollTrigger to trigger animations when the #video element enters the viewport. This triggers startPlay and begins video playback.
// Slider Transition: Animates the #slider div by translating it horizontally based on the current video’s index (videoId), creating a sliding carousel effect.
// 3. Effect for Controlling Video Playback
// Playback Management (useEffect on startPlay, videoId, etc.):
// If enough data has loaded, this effect checks isPlaying to determine whether the video should play or pause.
// Progress Indicator Animation (useEffect for videoId and startPlay):
// Uses gsap to animate the progress of each video.
// As the video progresses, currentProgress updates and animates the width and background color of elements in videoDivRef and videoSpanRef.
// onUpdate: Regularly updates the progress percentage and adjusts the width of the progress bar.
// onComplete: Resets the visual progress indicators and colors once a video ends or is paused.
// 4. Handling Video Events
// handleLoadedMetadata: Adds loaded video metadata to loadedData for playback readiness.
// handleProcess: Manages different video states:
// "video-end": Marks the current video as ended and moves to the next video.
// "video-last": Indicates the last video in the carousel.
// "video-reset": Resets the carousel to the first video.
// "pause" / "play": Toggles isPlaying to pause or resume the current video.
// 5. Rendering the Videos and Controls
// Rendering Videos:
// Each video in highlightsSlides renders with its associated metadata.
// Each video has an onEnded handler to trigger when the video ends, marking it as complete and advancing the carousel.
// Rendering Progress Indicators:
// Progress indicators are small circles below each video that track the playback visually.
// Control Button:
// Displays a play, pause, or replay button based on isPlaying and isLastVideo.
// Allows the user to reset or play/pause the video carousel manually.

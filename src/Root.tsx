import "./theme/fonts";
import { Composition } from "remotion";
import { VoiceStudioFilm } from "./compositions/VoiceStudioFilm";
import { DURATION } from "./data/timeline";
import { StoriesFilm } from "./stories/StoriesFilm";
import { CinemaFilm } from "./cinema/CinemaFilm";
import { DURATION as CINEMA_DURATION } from "./cinema/data";
import { CH, CW } from "./cinema/theme";
import { DURATION as STORIES_DURATION } from "./stories/data/timeline";
import { SH, SW } from "./stories/theme";
import { FPS, H, W } from "./theme/tokens";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VoiceStudioFilm"
        component={VoiceStudioFilm}
        durationInFrames={DURATION}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="VoiceStudioStories"
        component={StoriesFilm}
        durationInFrames={STORIES_DURATION}
        fps={FPS}
        width={SW}
        height={SH}
      />
      <Composition
        id="VoiceStudioCinema"
        component={CinemaFilm}
        durationInFrames={CINEMA_DURATION}
        fps={FPS}
        width={CW}
        height={CH}
      />
    </>
  );
};

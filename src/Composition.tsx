import React from 'react';
import { Composition, Folder } from 'remotion';
import { EmeraldCafe3D } from './scenes/EmeraldCafe3D';
import {
  EmeraldBedroom3D,
  EmeraldLab3D,
  EmeraldNightStreet3D,
  EmeraldShowcase3D,
  EmeraldStadium3D,
} from './scenes/EnvironmentShowcase3D';
import { NoFatigueShorts3D } from './scenes/NoFatigueShorts3D';
import { StopProcrastinating3D } from './scenes/StopProcrastinating3D';

export const MyComposition: React.FC = () => {
  return (
    <>
      <Composition
        id="NoFatigueShorts3D"
        component={NoFatigueShorts3D}
        durationInFrames={1152}
        fps={24}
        width={1080}
        height={1920}
        defaultProps={{
          captions: true,
        }}
      />
      <Composition
        id="StopProcrastinating3D"
        component={StopProcrastinating3D}
        durationInFrames={1440}
        fps={24}
        width={1920}
        height={1080}
        defaultProps={{
          captions: true,
        }}
      />
      <Composition
        id="EmeraldShowcase3D"
        component={EmeraldShowcase3D}
        durationInFrames={480}
        fps={24}
        width={1920}
        height={1080}
      />
      <Folder name="Sets-3D">
        <Composition
          id="EmeraldCafe3D"
          component={EmeraldCafe3D}
          durationInFrames={144}
          fps={24}
          width={1920}
          height={1080}
        />
        <Composition
          id="EmeraldLab3D"
          component={EmeraldLab3D}
          durationInFrames={96}
          fps={24}
          width={1920}
          height={1080}
        />
        <Composition
          id="EmeraldNightStreet3D"
          component={EmeraldNightStreet3D}
          durationInFrames={96}
          fps={24}
          width={1920}
          height={1080}
        />
        <Composition
          id="EmeraldStadium3D"
          component={EmeraldStadium3D}
          durationInFrames={96}
          fps={24}
          width={1920}
          height={1080}
        />
        <Composition
          id="EmeraldBedroom3D"
          component={EmeraldBedroom3D}
          durationInFrames={96}
          fps={24}
          width={1920}
          height={1080}
        />
      </Folder>
    </>
  );
};

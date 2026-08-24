//* Libraries imports
import { Fragment } from "react";

//* Components imports
import { PkmCenter } from "@/components/pkm-center";
import { Museum } from "@/components/museum";
import { Building1, Building2 } from "@/components/buildings";
import { Lamp } from "@/components/lamp";
import { Archway } from "@/components/archway";
import { CityStation } from "@/components/city-station";
import { RadioCityStation } from "@/components/radio-city-station";
import { TrainTracks } from "@/components/train-tracks";
import { TrainTracksFoot } from "@/components/train-track-foot";
import { Yacht } from "@/components/yacht";
import { Forest } from "@/components/forest";
import { Flower } from "@/components/flower";
import { GrassFloor } from "@/components/grass-floor";
import { BulletTrain } from "../city-station/bullet-train";
import { EnGate } from "@/components/en-gate";

export function City() {
  return (
    <Fragment>
      <GrassFloor />

      {/* center */}
      <PkmCenter position={[-8, -1, 9]} scale={0.25} />
      <Building1 position={[-12.7, -1, 9.5]} scale={0.85} />
      <Building1 position={[-12.7, -1, 12.8]} scale={0.85} />
      <Museum position={[10, -1, 7]} scale={0.25} />
      <Lamp position={[4, -1, 11]} scale={0.25} />
      <Lamp position={[-4, -1, 11]} scale={0.25} />

      {/* north block */}
      <EnGate position={[0, -1, -37.5]} scale={0.25} rotation={[0, Math.PI / 2, 0]} />
      <Building1 position={[6.5, -1, -31]} scale={0.85} />
      <Building1 position={[-6, -1, 25.5]} scale={0.85} />
      <Building1 position={[6.5, -1, 20.9]} scale={0.85} />
      <Building1 position={[6.5, -1, 24]} scale={0.85} />
      <Building1 position={[6.5, -1, 24]} scale={0.85} />
      <Building1 position={[19, -1, 25.5]} scale={0.85} />
      <Building1 position={[-7, -1, -29]} scale={0.85} />

      <Building2 position={[11, -1, -31]} scale={0.25} />
      <Building2 position={[14, -1, 26]} scale={0.25} />
      <Building2 position={[14, -1, 26]} scale={0.25} />
      <Building2 position={[14, -1, 26]} scale={0.25} />
      <Building2 position={[20, -1, 22]} scale={0.25} />
      <Building2 position={[20, -1, 18]} scale={0.25} />
      <Building2 position={[-7.5, -1, 22.5]} scale={0.25} />
      <Building2 position={[-11.6, -1, -28]} scale={0.25} />

      <Archway position={[0, -1, 26.8]} scale={0.28} />
      <Lamp position={[-4.8, -1, 19]} scale={0.25} />

      {/* east block */}
      <Building1 position={[20, -1, 14.5]} scale={0.85} />
      <Building1 position={[15.5, -1, 1]} scale={0.85} />
      <Building1 position={[20, -1, 1]} scale={0.85} />
      <Building2 position={[16, -1, -2]} scale={0.25} />

      <Lamp position={[-4, -1, -4]} scale={0.25} />
      <Lamp position={[4, -1, -4]} scale={0.25} />

      {/* station area, -7 */}
      <RadioCityStation position={[-15.6, -1, -7]} scale={0.25} />
      <CityStation position={[-8.5, -1, -7]} scale={0.25} />
      <BulletTrain position={[-15, 2.4, -7]} scale={0.03} />

      <TrainTracks position={[-1, -1, -7]} scale={0.06} />
      <TrainTracks position={[6.6, -1, -7]} scale={0.05995} />
      <TrainTracks position={[14.2, -1, -7]} scale={0.06} />
      <TrainTracks position={[21.8, -1, -7]} scale={0.05995} />
      <TrainTracksFoot position={[6.6, -1, -7]} scale={0.05995} />
      <TrainTracksFoot position={[14.2, -1, -7]} scale={0.05995} />

      {/* south block */}
      <Building1 position={[20, -1, -31]} scale={0.85} />
      <Building1 position={[15.5, -1, -31]} scale={0.85} />
      <Building2 position={[15.5, -1, -33.5]} scale={0.25} />
      <Building2 position={[20.3, -1, -33.5]} scale={0.25} />
      <Building2 position={[-16.5, -1, -28]} scale={0.25} />
      <Building2 position={[-16.5, -1, -31]} scale={0.25} />

      {/* surroundings */}
      <Yacht position={[-45, -1.5, -20]} scale={0.08} />
      <Forest baseY={-0.749} />
      <Flower />
    </Fragment>
  );
}

'use client';

//*Libraries imports
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Suspense } from 'react';

//*Store import
import { useDialogStore } from '@/store';

//*Components imports
import PlayIcon from '@/components/icons/play-icon';


type SceneProps = {
  children?: React.ReactNode;
}
export function Scene(props: SceneProps) {
  const dialogStore = useDialogStore();
  return (
    <div className='relative w-full h-svh'>
      <div className='absolute bottom-0 left-0 w-full z-10 flex justify-center pb-8'>
        {dialogStore.isOnDialog && (
          <div className='items-center justify-cente w-full max-w-5xl border py-1 px-2 rounded-2xl bg-black/50 pr-8 relative'>
            <div className='bg-white rounded-xl px-2 font-pixel text-base'>
              <h1 className='text-yellow-400'>Dialog</h1>
              <p>NPC ID: {dialogStore.npcId}</p>
              <p>Dialog ID: {dialogStore.dialogId}</p>
              <p>Dialog Line: {dialogStore.dialogLine}</p>
              <p>Olá tudo bem com você? cachaça cachorro Avô não vão</p>
            </div>
            <div className='absolute right-2 bottom-6 animate-bounce'>
              <PlayIcon className='size-4 rotate-90' fill='white' />
            </div>
          </div>

        )}
      </div>
      <Canvas camera={{ fov: 40 }}>
        <Suspense>
          <Physics debug>
            {props.children}
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
};

'use client';

//*Libraries imports
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';

//*Store import
import { useDialogStore } from '@/store';

//*Components imports
import PlayIcon from '@/components/icons/play-icon';


type SceneProps = {
  children?: React.ReactNode;
}
export function Scene(props: SceneProps) {
  const dialogStore = useDialogStore();
  const t = useTranslations("dialogs");
  const line = `${dialogStore.npcId}.${dialogStore.dialogId}.${dialogStore.dialogLine}`;
  return (
    <div className='relative w-full h-svh'>
      <div className='absolute bottom-0 left-0 w-full z-10 flex justify-center pb-8'>
        <button
          type='button'
          onClick={() => {
            dialogStore.advanceDialog();
          }} >
          Avançar
        </button>
        {dialogStore.isOnDialog && (
          <div className='items-center justify-cente w-full max-w-5xl border py-1 px-2 rounded-2xl bg-black/50 pr-8 relative'>
            <div className='bg-white h-28 rounded-xl px-2 font-pixel text-2xl flex items-center '>
              {/* @ts-expect-error */}
              {t(line)}

            </div>
            <div className='absolute right-2 bottom-6 animate-bounce'>
              {
                !dialogStore.isLastDialogLine && <PlayIcon className='size-4 rotate-90' fill='white' />

              }
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

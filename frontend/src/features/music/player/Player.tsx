import { usePlayerController } from './hooks/usePlayerController';
import { PlayerView } from './ui/PlayerView';

export function Player() {
  const viewProps = usePlayerController();
  return <PlayerView {...viewProps} />;
}

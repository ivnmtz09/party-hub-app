import { useGame } from '../context/GameContext'
import ImpostorSetupPage from './ImpostorSetupPage'
import RoleRevealPage from './RoleRevealPage'
import DebatePage from './DebatePage'
import VotingPage from './VotingPage'
import ResultsPage from './ResultsPage'

export default function ImpostorGameHub() {
  const { state } = useGame()

  if (!state) {
    return <ImpostorSetupPage />
  }

  switch (state.phase) {
    case 'Setup':
      return <ImpostorSetupPage />
    case 'Reveal':
      return <RoleRevealPage />
    case 'Debate':
      return <DebatePage />
    case 'Voting':
      return <VotingPage />
    case 'Result':
      return <ResultsPage />
    default:
      return <ImpostorSetupPage />
  }
}

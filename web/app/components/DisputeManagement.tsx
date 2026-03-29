'use client';

import { useWallet } from './WalletAdapterProvider';
import { useDisputes } from '../lib/hooks/useDisputes';
import { fetchPredinexContractEvents, predinexReadApi } from '../lib/adapters/predinex-read-api';

interface Dispute {
  id: number;
  poolId: number;
  poolTitle: string;
  disputer: string;
  disputeBond: number;
  disputeReason: string;
  votingDeadline: number;
  votesFor: number;
  votesAgainst: number;
  status: 'active' | 'resolved';
  resolution?: boolean;
  createdAt: number;
}

interface DisputeVote {
  disputeId: number;
  voter: string;
  vote: boolean;
  votedAt: number;
}

async function fetchDisputesFromContract(): Promise<Dispute[]> {
  try {
    const data = await fetchPredinexContractEvents(100);
    
    const disputes: Dispute[] = [];
    const events = data.results || [];
    
    for (const event of events) {
      if (event.event === 'smart_contract_event' && event.data.event_name === 'dispute-created') {
        const eventData = event.data.event_data;
        const pool = await predinexReadApi.getPool(eventData.pool_id);
        
        disputes.push({
          id: Number(eventData.dispute_id),
          poolId: Number(eventData.pool_id),
          poolTitle: pool?.title || `Pool #${eventData.pool_id}`,
          disputer: eventData.disputer,
          disputeBond: Number(eventData.bond),
          disputeReason: eventData.reason || 'Dispute reason not available',
          votingDeadline: Number(eventData.voting_deadline),
          votesFor: 0,
          votesAgainst: 0,
          status: 'active',
          createdAt: Number(eventData.created_at)
        });
      }
    }
    
    return disputes;
  } catch (error) {
    console.error('Failed to fetch disputes from contract:', error);
    return [];
  }
}

export default function DisputeManagement() {
  const { address } = useWallet();
  const {
    disputes,
    selectedTab,
    setSelectedTab,
    isLoading,
    now,
    hasUserVoted,
    getUserVote,
    handleVote,
  } = useDisputeManagement(address);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <DisputePageHeader />
      <DisputeTabNav selected={selectedTab} onSelect={setSelectedTab} />

      <div>
        {selectedTab === 'active' && (
          <ActiveDisputesSection
            disputes={disputes}
            now={now}
            isLoading={isLoading}
            hasUserVoted={hasUserVoted}
            getUserVote={getUserVote}
            onVote={handleVote}
          />
        )}
        {selectedTab === 'resolved' && <ResolvedDisputesSection disputes={disputes} />}
        {selectedTab === 'create' && <CreateDisputeSection isLoading={isLoading} />}
      </div>
    </div>
  );
}

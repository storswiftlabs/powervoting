import credits.leo;

// The `program` scope defines the data types, functions, and state associated with the `powervoting` program.
program power_voting_v0_6.aleo {
    
    // power voting token
    record PVToken {
        owner: address,
        name: field,        // token name, power voting token
        symbol: field,      // token symbol, PVT
        amount: u64,        // voting power, default is 1u64
    }

    // current proposals id, like auto-increament id in mysql  // 2074281269322187893875field => current proposal id
    // use 2074281269322187893875field (means "proposals" in string) as the fixed key here
    // TODO: use array instead of mapping when possible
    // https://vm.aleo.org/api/testnet3/program/${programID}/mapping/proposal_ids/2074281269322187893875field => xU64
    mapping proposal_ids: field => u64;

    // current votes id, like auto-increament id in mysql  // pid => current vote id
    // TODO: use array instead of mapping when possible
    // https://vm.aleo.org/api/testnet3/program/${programID}/mapping/vote_ids/x => xU64
    mapping vote_ids: u64 => u64;


    // proposals will be public for all users, store them into mapping.  // pid => proposal cid
    // https://vm.aleo.org/api/testnet3/program/${programID}/mapping/proposals/x => cid
    mapping proposals: u64 => field;


    // votes will be encoded by drand tlock with proposl expieration time, then the encoded hash will be stored into mapping,
    // so that everyone can retrieve the encoded votes to count after proposal expieration time.
    // TODO: use array instead of mapping when possible
    // pvid (pid append current vote id, e.g. pid-vid) => vote info
    mapping votes: field => field;

    // vote counts       // pid => option counts, append options counts to field, separator: -&&&&&-, e.g. option1-&&&&&-27-&&&&&-option2-&&&&&-15
    // https://vm.aleo.org/api/testnet3/program/${programID}/mapping/counts/x => xU64
    mapping counts: u64 => field;

    // voting power will be private, store them into record.
    record Power {
        owner: address,
        power: u64,             // voting power, default is 1u64
        withdrawable_block_height: u32, // withdrawable block height
    }

    // get power voting token
    transition mint_token(amount: u64) -> PVToken {
        return PVToken {
            owner: self.caller,
            name: 7006912922137281764648909451784002770527598field,   // stands for Power Voting Token string
            symbol: 5264980field,   // stands for PVT string
            amount: amount,
        };
    }

    // get voting power for voting, 1 power for each vote, private action.
    transition mint_power() -> Power {
        return Power {
            owner: self.caller,
            power: 1u64,    // 1 power
            withdrawable_block_height: 0u32,    // default can be withdrawed at any time.
        };
    }

    /**
    * get voting power for dao management, private action
    *4
    * token: PVT token
    * withdrawable_block_height: credits will be withdrew until which block
    **/
    transition mint_power_by_token(pvtoken: PVToken, withdrawable_block_height: u32) -> Power {
        //pvtoken will be used automatically after mint_power_by_token called
        return Power {
            owner: self.caller,
            power: pvtoken.amount,
            withdrawable_block_height: withdrawable_block_height,
        };
    }

    /**
    * withdraw token from voting power, private action
    * 
    * power: voting power
    **/
    transition withdraw_token_from_power(power: Power) -> PVToken {
        //generate a new PVToken when withdraw
        return PVToken {
            owner: self.caller,
            name: 7006912922137281764648909451784002770527598field,     // stands for Power Voting Token string
            symbol: 5264980field,   // stands for PVT string
            amount: power.power,
        } then finalize(power.withdrawable_block_height);
    }

    // finalize the withdraw feature, if current block height is smaller than power withdrawble_block_height, withdraw will be failed.
    finalize withdraw_token_from_power(withdrawable_block_height: u32) {
        assert(withdrawable_block_height <= block.height);
    }


    /**
    * convert voting power amount to microcredits amount.
    **/ 
    function amount_convert(r0: u64) -> u64 {
        return r0 * 1000000u64;
    }

    /**
    * get voting power for dao management, pledge aleo credits to mint voting power, private action.
    *
    * credit: aleo credits record, owned by user, will be pledged to mint voting power
    * amount: how many credits will be pledged to mint voting power
    * withdrawable_block_height: credits will be withdrew until which block
    **/
    transition mint_power_by_credits(credit: credits.leo/credits.record, amount: u64, withdrawable_block_height: u32)
        -> (credits.leo/credits.record, credits.leo/credits.record, Power) {

        let microcredits: u64 = amount_convert(amount);
        let (your_credits, their_change_credits): (credits, credits) = 
            credits.leo/transfer_private(credit, aleo1l44dfmwcu7j2e26yhrlhrxla4lsrmr0rxymxfzxj6h8m2mnegyqs8x0end, microcredits);
        let power: Power = Power {
             owner: self.caller,
             power: microcredits,
             withdrawable_block_height: withdrawable_block_height,
         };
       return(your_credits, their_change_credits, power);

    }

    /**
    * withdraw token from voting power, private action //todo: update comments
    *
    * credit: aleo credits record, owned by aleo1l44dfmwcu7j2e26yhrlhrxla4lsrmr0rxymxfzxj6h8m2mnegyqs8x0end, will be used to withdraw credits
    * amount: how many credits will be withdrew
    **/
    transition withdraw_credits_from_power(power: Power, credit: credits.leo/credits.record, amount: u64)
        -> (credits.leo/credits.record, credits.leo/credits.record) {

        let microcredits: u64 = amount_convert(amount);
        return credits.leo/transfer_private(credit, self.caller, microcredits) then finalize(power.withdrawable_block_height);
    }

    /**
    * finalize the withdraw feature, if current block height is smaller than power withdrawble_block_height, withdraw will be failed.
    **/
    finalize withdraw_credits_from_power(withdrawable_block_height: u32) {
        assert(withdrawable_block_height <= block.height);
    }

    /**
    * propose a new proposal, public action.
    *
    * title: proposal title
    * content: proposal content
    * options: proposal options, append options to field, separator: -&&&&&-, e.g. option1-&&&&&-option2-&&&&&-option3
    * vote_type: 0: single answer; 1: multiple answers
    * expieration: expieration time, votes will be visiable after this time.
    **/
    transition propose(public proposal_cid: field) {
        // finalize the proposal.
        return then finalize(proposal_cid);
    }

    /**
    * store proposal into mapping.
    **/
    finalize propose(proposal_cid: field) {
        let proposal_id_key: field = 2074281269322187893875field;   // means "proposals" in string
        // get proposal id or init with 0
        let pid: u64 = Mapping::get_or_use(proposal_ids, proposal_id_key, 0u64);
        // store proposal into proposals mapping
        Mapping::set(proposals, pid, proposal_cid);
        // update proposal id
        Mapping::set(proposal_ids, proposal_id_key, pid + 1u64);
    }


    transition vote (pid: u64, pvid: field, vote_options: field) {
        return then finalize(pid, pvid, vote_options);
    }

    finalize vote (pid: u64, pvid: field, vote_options: field) {
        Mapping::set(votes, pvid, vote_options);
        let vid: u64 = Mapping::get_or_use(vote_ids, pid, 0u64);
        Mapping::set(vote_ids, pid, vid + 1u64);
    }


    /**
    * vote on a proposal, private action
    *
    * pid: proposal id
    * pvid: pid append current vote id, e.g. pid-vid. TODO: use array instead of mapping when possible
    * hash: votes will be encoded by drand tlock with proposl expieration time
    * power: voting power record
    **/
    // transition vote(pid: u64, pvid: field, hash: field, power: Power) {
    //     // power record must belong to the caller
    //     assert_eq(power.owner, self.caller);
    //     // generate vote detail
    //     let vote_info: VoteInfo = VoteInfo {
    //         hash: hash,
    //         power: power.power,
    //     };
    //     // finalize the vote
    //     return then finalize(pid, pvid, vote_info.hash, vote_info.power);
    // }

    /**
    * store vote info into mapping
    *
    * pid: proposal id
    * pvid: pid append current vote id, e.g. pid-vid. TODO: use array instead of mapping when possible
    * hash: votes will be encoded by drand tlock with proposl expieration time
    * power: voting power
    **/
    // finalize vote(pid: u64, pvid: field, hash: field, power: u64) {
    //     // generate vote info
    //     let vote_info: VoteInfo = VoteInfo {
    //         hash: hash,
    //         power: power,
    //     };
    //     // store vote info into mapping
    //     Mapping::set(votes, pvid, vote_info);
    //     // update vote id
    //     let vid: u64 = Mapping::get_or_use(vote_ids, pid, 0u64);
    //     Mapping::set(vote_ids, pid, vid + 1u64);
    // }

    /**
    * count a proposal, public action
    *
    * pid: proposl id
    * option_counts: option counts, append options counts to field, separator: -&&&&&-, e.g. option1-&&&&&-27-&&&&&-option2-&&&&&-15
    **/
    transition count(public pid: u64, public option_counts: field) {
        return then finalize(pid, option_counts);
    }

    /**
    * finalize count
    *
    * pid: proposl id
    * option_counts: option counts, append options counts to field, separator: -&&&&&-, e.g. option1-&&&&&-27-&&&&&-option2-&&&&&-15
    **/
    finalize count(public pid: u64, public option_counts: field) {
        // store counts into mapping
        Mapping::set(counts, pid, option_counts);
    }
}

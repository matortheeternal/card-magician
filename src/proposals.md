# Proposals
Before making large changes to the codebase, contributors are encouraged to make a
proposal. Proposals are used to discuss ideas, explore tradeoffs, and reach
consensus before committing to an implementation.

Proposals are standard for features, and generally should not be used for resolving
bugs. Proposals may be used for bugs when resolving them requires the introduction or
alteration of entire systems. If you are unsure if a change warrants a proposal, make a
proposal anyway. Small, low-risk proposals should be accepted quickly with minimal
ceremony.

## What is a proposal?
A proposal is a conceptual description of a potential change to the system. It exists to
answer questions like:

- What problem are we trying to solve?
- What options were considered?
- What tradeoffs exist?
- Why is one approach preferable to others?

Proposals are intentionally not specifications or commitments. Rather, they are a
mechanism for structured discussion and decision-making.

## How to make a proposal

1. Create a new branch named `proposal/your-proposal`.
2. Copy [the proposal template](./proposalTemplate.md) to a new file named
   `~Your Proposal.md`. Use a clear, descriptive filename. You may omit the word
   "Proposal" from your filename—the leading `~` already indicates that the file is a
   proposal. Note: Proposal files are temporary files and should not be merged into
   master.
3. Write your proposal. Consider addressing motivation, current behavior, and multiple
   approaches. Consider different approaches upon the basis of what is standard in
   other software, tradeoffs, risks, and how well the approach matches existing
   [conventions](./architecture.md) in this codebase.
4. You may provide demo code or implementation spikes if you feel it is valuable for
   other developers to see to understand the proposal. It is recommended to place
   such code in a temporary `src/~proposal` folder. Prefer inline code blocks when
   possible.
5. Open a proposal PR on GitHub and apply the Proposal label to it.

## Outcomes
After discussion has taken place, a proposal PR will be marked as accepted, rejected, or
deferred. Accepted proposal PRs will be closed once their corresponding implementation
has been merged. When closing a proposal PR, a comment will be provided summarizing
the outcome and linking any other relevant PRs.

## Implementation
Implementation of your proposal should happen on a separate branch and a separate pull
request. Do not commit implementation onto your proposal branch or create an
implementation branch by branching off of the proposal branch. This is to make certain
that proposal documents, code, and git history are not merged into master.

Once a proposal is implemented and closed, documentation should be the source of truth
on how the code actually functions, with the closed proposal PR serving as a
discussion artifact that is discoverable on the GitHub Pull Requests page.

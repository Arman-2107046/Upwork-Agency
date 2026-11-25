export interface ProcessStep {
  title: string
  text: string
}

export const processSteps: ProcessStep[] = [
  {
    title: 'Discover',
    text: 'We clarify goals, scope and requirements, and agree on clear milestones.',
  },
  {
    title: 'Design',
    text: 'We shape the interface and the architecture before production code is written.',
  },
  {
    title: 'Build',
    text: 'We develop in scoped milestones, with regular updates and code in your repository.',
  },
  { title: 'Deploy', text: 'We set up servers, CI/CD and SSL, then launch to production.' },
  { title: 'Support', text: 'We provide ongoing maintenance and technical support after launch.' },
]

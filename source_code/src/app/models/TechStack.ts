
export type TechStack = {
  name: string;
  logo: string;
  linked_stacks: TechStack[];
};

export type CategorizedTechStack = {
  category: string;
  stacks: TechStack[];
}

export const techStack = (name: string, linked_stacks: string[] = []) : TechStack => ({
  name : name.toLowerCase(),
  logo: `tech-icons/${name.toLowerCase()}.svg`,
  linked_stacks: linked_stacks.map(stack => techStack(stack))
})

export const buildStack = (name: string, linked_stacks: TechStack[] = []) : TechStack => ({
  name : name.toLowerCase(),
  logo: `tech-icons/${name.toLowerCase()}.svg`,
  linked_stacks: linked_stacks
})

export const Spring = techStack('Spring');
export const SpringBoot = techStack('SpringBoot');
export const Hibernate = techStack('Hibernate');
export const Quarkus = techStack('Quarkus');
export const JUnit = techStack('JUnit');
export const Ktor = techStack('Ktor');
export const Rocket = techStack('Rocket');
export const Tokio = techStack('Tokio');
export const Tauri = techStack('Tauri');

export const Angular = techStack('Angular');
export const SolidJs = techStack('SolidJs');

export const Java = buildStack('Java', [Spring, Hibernate, Quarkus, JUnit]);
export const Kotlin = buildStack('Kotlin', [SpringBoot, Ktor]);
export const Rust = buildStack('Rust', [Rocket, Tokio, Tauri]);
export const Go = buildStack('Go');

export const Typescript = buildStack('Typescript', [Angular, SolidJs]);
export const Elm = buildStack('Elm');


const explodeStack = (stack: TechStack) : TechStack[] => {
  return [stack, ...stack.linked_stacks.flatMap(explodeStack)]
}

export const STACKS : CategorizedTechStack[] = [
  {
    category: 'backend',
    stacks: [... new Set<TechStack>([
      ...explodeStack(Java),
      ...explodeStack(Kotlin),
      ...explodeStack(Rust),
      ...explodeStack(Go),
    ])]

  },
  {
    category: 'frontend',
    stacks: [...new Set<TechStack>([
      ...explodeStack(Typescript),
      ...explodeStack(Elm)
    ])],

  },


]

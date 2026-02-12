
export type StackType = 'Language' | 'Framework' | 'Tools';

export type TechStack = {
  name: string;
  type: StackType;
  logo: string;
  linked_stacks: TechStack[];
};

export type CategorizedTechStack = {
  category: string;
  stacks: TechStack[];
}

export const framework = (name: string, extension: string = 'svg') : TechStack => ({
  name : name.toLowerCase(),
  logo: `tech-icons/${name.toLowerCase()}.${extension}`,
  linked_stacks: [],
  type: 'Framework'
})


export const language = (name: string, linked_stacks: TechStack[] = [], extension: string = 'svg',) : TechStack => ({
  name : name.toLowerCase(),
  logo: `tech-icons/${name.toLowerCase()}.${extension}`,
  linked_stacks: linked_stacks,
  type: 'Language'
})

export const tool = (name: string, extension: string = 'svg') : TechStack => ({
  name : name.toLowerCase(),
  logo: `tech-icons/${name.toLowerCase()}.${extension}`,
  linked_stacks: [],
  type: 'Tools'
})

export const Spring = framework('Spring');
export const SpringBoot = framework('SpringBoot');
export const Hibernate = framework('Hibernate');
export const Quarkus = framework('Quarkus');
export const JUnit = framework('JUnit');
export const Ktor = framework('Ktor');
export const Rocket = framework('Rocket');
export const Tokio = framework('Tokio');
export const Tauri = framework('Tauri');
export const Fiber = framework('Fiber');
export const Mux = framework('Mux', 'png');
export const Vertx = framework('Vertx');
export const WebAssembly = framework('WebAssembly');

export const Burn = framework('Burn');
export const Polars = framework('Polars');

export const Pandas = framework('Pandas');
export const ScikitLearn = framework('Scikit-Learn');
export const Keras = framework('Keras');

export const Angular = framework('Angular');
export const React = framework('React');
export const SolidJs = framework('SolidJs');
export const ElysiaJs = framework('ElysiaJs');
export const Flutter = framework('Flutter');

export const TailwindCss = framework('TailwindCss');
export const Sass = framework('Sass');


export const Java = language('Java', [Spring, Hibernate, Quarkus, JUnit]);
export const Kotlin = language('Kotlin', [SpringBoot, Ktor, Vertx]);
export const Rust = language('Rust', [Rocket, Tokio, Tauri, WebAssembly]);
export const Rust_ML = language('Rust', [Burn, Polars]);
export const Go = language('Go', [Fiber, Mux]);
export const Python = language('Python', [Pandas, ScikitLearn, Keras]);

export const Typescript = language('Typescript', [Angular, React, SolidJs]);
export const JavaScript = language('JavaScript', [ElysiaJs]);
export const Elm = language('Elm');
export const Htmx = language('Htmx');
export const Html = language('Html');
export const Css = language('Css', [TailwindCss, Sass]);
export const Dart = language('Dart', [Flutter]);

export const Postgres = tool('Postgres' );
export const MySql = tool('MySql' );
export const Mongo = tool('Mongo' );
export const Surreal = tool('SurrealDB','png');

export const Kafka = tool('Kafka');
export const Rabbitmq = tool('Rabbitmq');

export const Gitlab = tool('Gitlab');
export const Github = tool('Github');
export const GithubActions = tool('GithubActions');
export const Docker = tool('Docker');
export const Jira = tool('Jira');
export const Intellij = tool('Intellij');
export const Portainer = tool('Portainer');
export const Jaeger = tool('Jaeger');

export const Cucumber = tool('Cucumber');
export const Selenium = tool('Selenium');
export const Sonarqube = tool('Sonarqube');

export const Rest = tool('Rest', 'webp');
export const Grpc = tool('Grpc');
export const Amqp = tool('AMQP', 'png');


const explodeStack = (stack: TechStack) : TechStack[] => {
  return [stack, ...stack.linked_stacks.flatMap(explodeStack)]
}
const categorizedStack = ( category: string, stacks: TechStack[]) : CategorizedTechStack => ({
  category,
  stacks: [ ...new Set(stacks.flatMap(explodeStack).sort(() => Math.random() - 0.5))]
})

export const STACKS : CategorizedTechStack[] = [
  categorizedStack('backend', [Java, Kotlin, Rust, Go]),
  categorizedStack('frontend', [Html, Css, Typescript, JavaScript, Elm , Htmx, Dart]),
  categorizedStack('Machine Learning', [Python, Rust_ML]),
  categorizedStack('Http Protocols', [ Rest, Grpc, Amqp]),
  categorizedStack('messaging queue', [Kafka, Rabbitmq]),
  categorizedStack('Test & Quality', [Cucumber, Selenium, Sonarqube]),
  categorizedStack('CI/CD & TOOLS', [Gitlab, Github, GithubActions, Docker, Jira, Intellij, Portainer, Jaeger]),
  categorizedStack('database', [Postgres, MySql, Mongo, Surreal]),
]


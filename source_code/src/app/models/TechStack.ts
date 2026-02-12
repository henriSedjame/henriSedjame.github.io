import {Option, orElse} from '@hsedjame/optionjs';

export type StackType = 'Language' | 'Framework' | 'Tools';

export type TechStack = {
  name: string;
  label: string;
  type: StackType;
  logo: string;
  linked_stacks: TechStack[];
};

export type CategorizedTechStack = {
  category: string;
  stacks: TechStack[];
}

export const framework = (name: string, label: Option<string> = undefined, extension: string = 'svg') : TechStack => ({
  name : name.toLowerCase(),
  label: orElse(label, () => name),
  logo: `tech-icons/${name.toLowerCase()}.${extension}`,
  linked_stacks: [],
  type: 'Framework'
})


export const language = (name: string,  linked_stacks: TechStack[] = [], label: Option<string> = undefined, extension: string = 'svg',) : TechStack => ({
  name : name.toLowerCase(),
  label: orElse(label, () => name),
  logo: `tech-icons/${name.toLowerCase()}.${extension}`,
  linked_stacks: linked_stacks,
  type: 'Language'
})

export const tool = (name: string, label: Option<string> = undefined, extension: string = 'svg') : TechStack => ({
  name : name.toLowerCase(),
  label: orElse(label, () => name),
  logo: `tech-icons/${name.toLowerCase()}.${extension}`,
  linked_stacks: [],
  type: 'Tools'
})

export const Spring = framework('Spring');
export const SpringBoot = framework('SpringBoot', 'Spring Boot');
export const Hibernate = framework('Hibernate');
export const Quarkus = framework('Quarkus');
export const JUnit = framework('JUnit');
export const Ktor = framework('Ktor');
export const Rocket = framework('Rocket');
export const Tokio = framework('Tokio');
export const Tauri = framework('Tauri');
export const Fiber = framework('Fiber');
export const Mux = framework('Mux', 'Gorilla Mux','png');
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
export const Rust = language('Rust', [Rocket, Tokio, Tauri,  WebAssembly]);
export const Rust_ML = language('Rust', [Burn, Polars]);
export const Go = language('Go', [Fiber, Mux], 'Golang');
export const Python = language('Python', [Pandas, ScikitLearn, Keras]);

export const Typescript = language('Typescript', [Angular, React, SolidJs]);
export const JavaScript = language('JavaScript', [ElysiaJs]);
export const Elm = language('Elm');
export const Htmx = language('HTMX', );
export const Html = language('HTML');
export const Css = language('CSS', [TailwindCss, Sass]);
export const Dart = language('Dart', [Flutter]);

export const Postgres = tool('Postgres', 'PostgreSQL');
export const MySql = tool('MySql' );
export const Mongo = tool('Mongo', 'MongoDB' );
export const Surreal = tool('SurrealDB', undefined,'png');

export const Kafka = tool('Kafka');
export const Rabbitmq = tool('RabbitMQ');

export const Gitlab = tool('Gitlab');
export const Github = tool('Github');
export const GithubActions = tool('GithubActions', 'GitHub Actions');
export const Docker = tool('Docker');
export const Jira = tool('Jira');
export const Intellij = tool('Intellij');
export const Portainer = tool('Portainer');
export const Jaeger = tool('Jaeger');

export const Cucumber = tool('Cucumber');
export const Selenium = tool('Selenium');
export const Sonarqube = tool('SonarQube');

export const Rest = tool('REST', undefined, 'webp');
export const Grpc = tool('gRPC');
export const Amqp = tool('AMQP', undefined,'png');


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
  categorizedStack('CI/CD & TOOLS', [Gitlab, Github, GithubActions, Docker, Jira, Intellij, Portainer, Jaeger]),
  categorizedStack('Test & Quality', [Cucumber, Selenium, Sonarqube]),
  categorizedStack('database', [Postgres, MySql, Mongo, Surreal]),
]


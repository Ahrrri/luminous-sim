// src/workers/worker.d.ts
declare module '*?worker' {
    // 생성자 타입 정의
    const WorkerConstructor: {
      new(): Worker;
    };
    
    // 기본 내보내기
    export default WorkerConstructor;
  }
// contentsno                            NUMBER(10)         NOT NULL,
// employeeno                            NUMBER(10)     NOT NULL , -- FK
// cateno                                NUMBER(10)         NOT NULL , -- FK
// title                                 VARCHAR2(200)         NOT NULL,
// content                               CLOB                  NOT NULL,
// recom                                 NUMBER(7)         DEFAULT 0         NOT NULL,
// cnt                                   NUMBER(7)         DEFAULT 0         NOT NULL,
// replycnt                              NUMBER(7)         DEFAULT 0         NOT NULL,
// password                              VARCHAR2(100)         NOT NULL,
// word                                  VARCHAR2(200)         NULL ,
// rdate                                 VARCHAR2(19)               NOT NULL,
// file1                                   VARCHAR(100)          NULL,  -- 원본 파일명 image
// file1saved                            VARCHAR(100)          NULL,  -- 저장된 파일명, image
// thumb1                              VARCHAR(100)          NULL,   -- preview image
// size1                                 NUMBER(10)      DEFAULT 0 NULL,  -- 파일 사이즈
// price                                 NUMBER(10)      DEFAULT 0 NULL,  
// dc                                    NUMBER(10)      DEFAULT 0 NULL,  
// saleprice                            NUMBER(10)      DEFAULT 0 NULL,  
// point                                 NUMBER(10)      DEFAULT 0 NULL,  
// salecnt                               NUMBER(10)      DEFAULT 0 NULL,
// map                                   VARCHAR2(1000)            NULL,
// youtube                               VARCHAR2(1000)            NULL,
// mp4                                  VARCHAR2(100)            NULL,
// visible                                CHAR(1)         DEFAULT 'Y' NOT NULL,

export default interface ContentsType {
  contentsno?: number;
  cateno?: number;
  memberno?: number;
  title?: string;
  content?: string;
  passwd?: string;
  word?: string;
  views?: number; // 💡 이 줄을 추가해 주세요!
  rdate?: string;
  file1?: string;
  file1saved?: string;
  thumb1?: string;
  size1?: number;
  size1_label?: string;
  youtube?: string;
  map?: string;
  cnt?: number;
  recom?: number;
}


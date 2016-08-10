CREATE TABLE levels
(
  levelID     INT NOT NULL,
  level_seq   INT NOT NULL,
  description VARCHAR(500) NOT NULL,
  CONSTRAINT level_PK     PRIMARY KEY (levelID),
  CONSTRAINT level_seq_UQ UNIQUE (level_seq)
);

CREATE TABLE attributes
(
  attributeID    INT NOT NULL,
  name           VARCHAR(100) NOT NULL,
  description    VARCHAR(500),
  attribute_type VARCHAR(30) NOT NULL,
  default_value  VARCHAR(500),
  list_values    VARCHAR(2000),
  CONSTRAINT attributes_PK PRIMARY KEY (attributeID)
);

CREATE TABLE level_attributes
(
  levelID          INT NOT NULL,
  attributeID      INT NOT NULL,
  CONSTRAINT PRIMARY KEY levelAttribute_PK  (levelID, attributeID),
  CONSTRAINT FOREIGN KEY levelAttribute_FK1 (levelID)     REFERENCES levels(levelID),
  CONSTRAINT FOREIGN KEY levelAttribute_FK2 (attributeID) REFERENCES attributes(attributeID)
);

CREATE TABLE teams
(
  teamID     INT NOT NULL,
  name       VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  comments   VARCHAR(2000),
  CONSTRAINT teams_PK PRIMARY KEY (teamID)
);

CREATE TABLE people
(
  personID  INT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email     VARCHAR(100) NOT NULL,
  position  VARCHAR(100) NOT NULL,
  comments  VARCHAR(2000),
  teamID    INT NOT NULL,
  CONSTRAINT people_PK      PRIMARY KEY (personID),
  CONSTRAINT people_team_FK FOREIGN KEY (teamID) REFERENCES teams(teamID)
);

CREATE TABLE nodes
(
  nodeID      INT NOT NULL,
  name        VARCHAR(100) NOT NULL,
  xPos        INT NOT NULL,
  yPos        INT NOT NULL,
  zIndex      INT NOT NULL,
  width       INT NOT NULL,
  height      INT NOT NULL,
  class       VARCHAR(500),
  style       VARCHAR(500),
  parentID    INT,
  levelID     INT NOT NULL,
  CONSTRAINT node_PK        PRIMARY KEY (nodeID),
  CONSTRAINT node_parent_FK FOREIGN KEY (parentID) REFERENCES nodes(nodeID),
  CONSTRAINT node_level_FK  FOREIGN KEY (levelID)  REFERENCES levels(levelID)
);

CREATE TABLE node_attributes
(
  nodeID       INT NOT NULL,
  attributeID  INT NOT NULL,
  value_text   VARCHAR(2000),
  value_date   DATETIME,
  value_number INT,
  CONSTRAINT node_attributes_PK  PRIMARY KEY (nodeID, attributeID),
  CONSTRAINT node_attributes_FK1 FOREIGN KEY (nodeID) REFERENCES nodes(nodeID),
  CONSTRAINT node_attributes_FK2 FOREIGN KEY (attributeID) REFERENCES attributes(attributeID)
);

CREATE TABLE node_teams
(
  teamID INT NOT NULL,
  nodeID INT NOT NULL,
  CONSTRAINT node_teams_PK  PRIMARY KEY (teamID, nodeID),
  CONSTRAINT node_teams_FK1 FOREIGN KEY (teamID) REFERENCES teams(teamID),
  CONSTRAINT node_teams_FK2 FOREIGN KEY (nodeID) REFERENCES nodes(nodeID)
);

CREATE TABLE node_people
(
  nodeID   INT NOT NULL,
  personID INT NOT NULL,
  CONSTRAINT node_people_PK  PRIMARY KEY (nodeID, personID),
  CONSTRAINT node_people_FK1 FOREIGN KEY (nodeID) REFERENCES nodes(nodeID),
  CONSTRAINT node_people_FK2 FOREIGN KEY (personID) REFERENCES people(personID)
);

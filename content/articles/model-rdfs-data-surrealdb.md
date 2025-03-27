---
title: Adapt a generic RDFS model to SurrealDB
description: Of to represent Tryples with SurrealDB and how to query them.
tags:
  - db
  - ontology
  - development
draft: false
# slug: create-spell-check-job-gitlab
date: 2025-10-01
---

## Introduction

In this article, we will show you how to adapt a generic RDFS model to SurrealDB. We will see how to represent Tryples with SurrealDB and how to query them.
How to represent Tryples with SurrealDB and how to query them.

How SurrealDB works ?

SurrealDB is a next-gen DB. It ahndles relationship, key-value store and graph database. It can flexibly define the schema of the data and query it with SQL-like language.

**N-tryples** representation

One challenge of this implementation is to have a query engine that can handle the N-triples representation of the data.
N-triples is a plain text format for encoding RDF data in a subject-predicate-object format.
Each line in an N-triples file represents a single RDF triple.
Here is an example of a N-tryples query with SparQL:

```sparql
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX voc: <https://swapi.co/vocabulary/>
prefix film: <https://swapi.co/resource/film/>
SELECT ?planet ?film ?population
WHERE {
    ?planet a voc:Planet ;
	   voc:film ?film ;
       voc:population ?population .
    FILTER(?film = film:6 && ?population < 2000000)
}
```

In this query, we will display the planetClasses that are in the film 6 and have a population less than 2 million.

The goal of this exercice is to implement a Star Wars Ontology in SurrealDB.
It should be schema extensible and should be able to query the data in the same way as a simple SparQL-like language.

We can easily represents a N-tryple query

<!-- TODO: Add surealql query examples and definitions -->

```sql

```

The Case: A Star Wars Ontology

For this example, w ewill useda Star-Wars Ontology. This ontology describes the Star Wars universe. It contains information about the characters, planets, species, starships, vehicles, and films in the Star Wars universe, in a turtle format.

Here is an example of the representation of `Mustafar` planet:

```rdfs
https://swapi.co/resource/planet/13> a voc:Planet ;
    rdfs:label "Mustafar"^^xsd:string ;
    voc:climate "hot"^^xsd:string ;
    voc:desc "None"^^xsd:string ;
    voc:diameter 4200 ;
    voc:film <https://swapi.co/resource/film/6> ;
    voc:gravity "1 standard"^^xsd:string ;
    voc:orbitalPeriod 412 ;
    voc:population 20000 ;
    voc:rotationPeriod 36 ;
    voc:surfaceWater 0 ;
    voc:terrain "volcanoes, lava rivers, mountains, caves"^^xsd:string .
```

A few things to note:
As you can see, this planet is associated with different objects trough the voc namespace.
It contains the datatype associated to RDF: `xsd:string` and `xsd:int`.
we can see that the objects are linked to each other. For example, our planet Mustafar is linked to the film 6 (Revenge of the Sith) through the `film` predicate.

Here is another example of a planeet contenained in the ontology:

```rdfs
<https://swapi.co/resource/planet/20> a voc:Planet ;
    rdfs:label "Stewjon"^^xsd:string ;
    voc:climate "temperate"^^xsd:string ;
    voc:desc "None"^^xsd:string ;
    voc:diameter 0 ;
    voc:gravity "1 standard"^^xsd:string ;
    voc:resident <https://swapi.co/resource/human/10> ;
    voc:terrain "grass"^^xsd:string .
```

As you can see, this planet has slighly differents properties than the other one.
orbitalPeriod, population and rotationPeriod are not present in this object and a new property `resident` is present.

This is only one example, but it's to show you, that there is no rules to describe a Class in an ontology.

### Evaluate the Ontology

There are plenty of planets described in this ontology. So we need to find a way to represent them in SurrealDB.

We will first search for each property and the type of the property. We will then see how to represent them in SurrealDB.

For that, thanks to SparQL, we can query the ontology to find the properties and the type of the properties.

```sparql
PREFIX voc: <https://swapi.co/vocabulary/>
SELECT
    ?property
    (COUNT(DISTINCT ?planet) as ?count)
    (GROUP_CONCAT(DISTINCT ?datatype; separator=", ") as ?datatypes)
    (GROUP_CONCAT(DISTINCT ?objectType; separator=", ") as ?objectTypes)
    (SAMPLE(?value) as ?exampleValue)
WHERE {
    ?planet a voc:Planet ;
            ?property ?value .
    OPTIONAL {
        ?value a ?objectType .
    }
    BIND(datatype(?value) as ?datatype)
}
GROUP BY ?property
ORDER BY DESC(?count)
```

This query:

- Count the number of property present in the ontology for each planet
- Shows datatypes for literal values
- Shows types for object properties
- Shows an example value for each property

Here is the result of the query, putted in a Markdown table:

| Property       | Count | Datatypes | ObjectTypes                                                                                                          | ExampleValue                             |
| -------------- | ----- | --------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| type           | 61    |           | https://swapi.co/vocabulary/planet                                                                                   | voc:Planet                               |
| label          | 61    | string    |                                                                                                                      | Mustafar                                 |
| desc           | 61    | string    |                                                                                                                      | None                                     |
| terrain        | 54    | string    |                                                                                                                      | volcanoes, lava rivers, mountains, caves |
| resident       | 49    |           | "http://www.w3.org/2002/07/owl#Thing, https://swapi.co/vocabulary/Character, https://swapi.co/vocabulary/Mammal,..." | https://swapi.co/vocabulary/human/10     |
| climate        | 48    | string    |                                                                                                                      | hot                                      |
| orbitalPeriod  | 48    | integer   |
| rotationPeriod | 48    | integer   |
| gravity        | 45    | string    |                                                                                                                      | 1 standard                               |
| diameter       | 44    | integer   |                                                                                                                      | 4200                                     |
| population     | 43    | integer   |                                                                                                                      | 20000                                    |
| surfaceWater   | 26    | integer   |                                                                                                                      | 0                                        |
| film           | 21    |           | https://swapi.co/vocabulary/Film                                                                                     | https://swapi.co/vocabulary/film/6       |

As you can see, we have 61 properties for the planet class. We have different datatypes for the properties and different object types for the object properties.
Only the `type`, `label` and `desc` properties are present in all the planets.
Other properties can be present or not in the planet object.
Also, we can see that the Resident Property is linked to different types of objects.

### Improve our script

There is a little step, we can do to improve our script. Currently, we don't now for each string if there are multiple possible values. We can add this information to our script, to identify which properties would lead to a multi-value column.

Here is the updated query:

```sparql
PREFIX voc: <https://swapi.co/vocabulary/>
SELECT
    ?property
    (MAX(?valueCountPerPlanet) as ?maxValuesPerPlanet)
WHERE {
    ?planet a voc:Planet ;
            ?property ?value .

    # Count values per planet
    {
        SELECT ?planet ?property (COUNT(?value) as ?valueCountPerPlanet)
        WHERE {
            ?planet a voc:Planet ;
                    ?property ?value .
        }
        GROUP BY ?planet ?property
    }

    OPTIONAL {
        ?value a ?objectType .
    }
    BIND(datatype(?value) as ?datatype)
}
GROUP BY ?property
ORDER BY DESC(?maxValuesPerPlanet)
```

And here is the result of the query, putted in a Markdown table:

| Property     | MaxValuesPerPlanet |
| ------------ | ------------------ |
| voc:resident | 11                 |
| rdf:type     | 5                  |
| voc:film     | 5                  |
| rdfs:label   | 1                  |
| voc:label    | 1                  |
| voc:climate  | 1                  |

_Fig 2: Max Values of the label for each planets. End of the table have been truncated_

So, thanks to this query, we have identified to our script that the `resident` and `film` property are multi-value property.
You understand that it's important to know that, because we will have to represent them in a different way inside our relation DB.

> [!warning]
> the count type property here is the number of different values for the property in the ontology, it doesn't mean that the property is multi-valued.

For the complete query that group everything together, you can check this [gist](https://gist.github.com/GridexX/6d282913b8baf45ec0e3d1c2283dfb5b)

Now that, we have a better understanding of the ontology, we can start to represent it in SurrealDB.

### Represent the Ontology in SurrealDB

In this section, we will see how to represent the ontology in SurrealDB.
SurrealDB has several ways to represent the data. We can use Schemafull classes, SchemaLess tables or a mix of both.

For the relation between the objects, we have two choice. We can eather use Record links or Graph Edges. Record links provides ability to traverse from record-to-record without the need for traditional SQL JOINs, whereas Graph provide a powerful and flexible way to access and manipulate data within records using paths.

Here is an example of a how record links can be manipulated in SurrealDB:

```sql
CREATE person:simon SET name = 'Simon';
CREATE person:marcus SET name = 'Marcus';
CREATE person:tobie SET name = 'Tobie', friends = [person:simon, person:marcus];

SELECT friends.name FROM person:tobie;
```

```json title="Response"
[
  {
    "friends": {
      "name": ["Simon", "Marcus"]
    }
  }
]
```

With record links, we directly reference the object in the property of the object.
Under the hood, SurrealDB will create a pointer to the object.

Let's see how The RELATE statement can be used to generate graph edges between two records in the database.

```sql
RELATE person:tobie->has_friend->person:simon;
RELATE person:tobie->has_friend->person:marcus;
```

```json title="Response"
[
	{
		id: has_friend:ysbab20nv5568ogba6ns,
		in: person:tobie,
		out: person:simon
	},
	{
		id: has_friend:0ltm6xr94pkblyxf0m6c,
		in: person:tobie,
		out: person:marcus
	}
]
```

Access the graph edges.

```sql
person:tobie->has_friend->?.*;
```

```json title="Response"
[
	{
		id: person:marcus,
		name: 'Marcus'
	},
	{
		id: person:simon,
		name: 'Simon'
	}
]
```

With this method, we can create a graph of the relation between the objects.

As you can see, it's very flexible, so we will try different approach to see which one is the best for our use case.

Appart from that, we can also tell SurrealDB to use a schema specific constraint to our data.
This approach is useful when we have a fixed schema for our data.
SurrealDB allows to combine both Schemafull (validation of the data) and schemaless (flexibility of the data) approach
inside one database.

Now that we have all the tools in hand, we can start to represent the ontology in SurrealDB.

Scenario I: Implement Schemafull classes.

In this approach, we will use a class for each object in the ontology. We will create a class for the planet, film, character, etc.
Each class will have the properties of the object, even the optional.
We will then link the objects together, thanks to **Record link**.

Commonly to all approach, we will define some table to will be used in our planet class.

```sql
DEFINE TABLE film schemaless;
CREATE film CONTENT {
    id: "6",
    name: "Revenge of the Syth",
    characters: []
};

DEFINE TABLE character schemaless;
CREATE character CONTENT {
    id: "1",
    label: "Luke Skywalker",
    eyeColor: "blue",
    gender: "male"
}
```

Here we create 2 classes, film and character. We will then link them to the planet class.

With this approach all fields are used. So our planet will define all fields, plus specify optionnal one:

```sql
DEFINE TABLE planet schemafull;
DEFINE FIELD label ON TABLE planet TYPE string;
DEFINE FIELD desc ON TABLE planet TYPE string;
DEFINE FIELD terrain ON TABLE planet TYPE option<string>;
DEFINE FIELD residents ON TABLE planet TYPE option<array<record<character>>>;
DEFINE FIELD films ON TABLE planet TYPE array<record<film>>;
DEFINE FIELD climate ON TABLE planet TYPE option<string>;
DEFINE FIELD diameter ON TABLE planet TYPE option<int>;
DEFINE FIELD population ON TABLE planet TYPE option<int>;
DEFINE FIELD orbitalPeriod ON TABLE planet TYPE option<int>;
DEFINE FIELD rotationPeriod ON TABLE planet TYPE option<int>;
DEFINE FIELD surfaceWater ON TABLE planet TYPE option<int>;
DEFINE FIELD gravity ON TABLE planet TYPE option<string>;
```

### Create data

Now, we can easily instantiate a planet object:

```json
CREATE planet:13 CONTENT {
    label: "Mustafar",
    desc: "None",
    diameter: 4200,
    gravity: "1 standard",
    population: 20000,
    orbitalPerdiod: 412,
    rotationPeriod: 36,
    surfaceWater: 0,
    terrain: "volcanoes, lava rivers, mountains, caves",
    films: [film:6],
};
```

However, there is a big question about datatypes. In the RDF model, each of our property has a datatype. We can't represent this with only this schema.
One approach will be to create a class for each type. For example, we can create a class for the string, int, etc. and link them to the property.
However, the problem with this approach is if we have multiple datatype in the whole ontology.

To keep consistenty, we will instantiate a Schema for each table. We will then link the object to the schema.

### Keeping track of the RDF information.

Useally RDF is depicted with 3 optional fields: subject, predicate and object.
The object can be enriched with the datatype and the language.

Here we can enrich, the planet Class with the RDF information.

First, we need to store the prefix for our vocabulary.
To do so, we will use create a table, that will map the prefix to their values:

```sql
DEFINE TABLE prefix schemafull;
DEFINE FIELD value ON TABLE prefix TYPE string;
// For example, we can create a prefix for the vocabulary
CREATE prefix:voc SET value="https://swapi.co/vocabulary/";
CREATE prefix:xsd SET value="http://www.w3.org/2001/XMLSchema#";
```

We can now create a object table that contains the enriched information of the object.

```sql
DEFINE TABLE object schemafull;
DEFINE FIELD type ON TABLE object TYPE {prefix:record<prefix>,value:string};
DEFINE FIELD dataType ON TABLE object TYPE option<prefix:record<prefix>, value:"string" | "int">;
DEFINE FIELD language ON TABLE object TYPE option<"eu"|"de">;
```

Now we could easily enrich each property of our planet object with the RDF information:

```sql
CREATE object:planet_desc CONTENT {
    type: {prefix: prefix:voc, value: "desc"},
    dataType: {prefix: prefix:xsd, value: "string"}
};
CREATE object:planet_diameter CONTENT {
    type: {prefix: prefix:voc, value: "diameter"},
    dataType: {prefix: prefix:xsd, value: "int"}
};
```

We can also store the type of our planet object:

```sql
CREATE object:planet CONTENT {
    type: {prefix: prefix:voc, value: "Planet"}
};
```

We can now create a big Schema, that will hold all the information of the planet object.

```sql
CREATE schema:planet CONTENT {
    type: object:planet,
    desc: object:planet_desc,
    planet_diameter: object:planet_diameter,
    // Other fields ...
}
```

As you can see, the schema is a big object that contains all the information of the planet object. It's a good way to keep track of the RDF information.
Now that we have store the schema and the object, we can link them together.

```sql
DEFINE FIELD schema ON TABLE planet TYPE record<schema>;
UPDATE planet SET schema = schema:planet;
SELECT schema, label FROM planet;
```

```json title="Response"
[
	{
		label: 'Tatooine',
		schema: schema:planet
	},
	{
		label: 'Mustafar',
		schema: schema:planet
	}
]
```

### Query the data

Now that we have represented the data, we can query it.

For example if we want to retrieve the fields of all Residents located in a planet, we can do:

```sql
planet:1.residents[*].*;
```

```json title="Response"
[
	{
		eyeColor: 'blue',
		gender: 'male',
		id: character:1,
		label: 'Luke Skywalker'
	}
]
```

The planet 1 is Tatooine, and it has only one resident, Luke Skywalker.

```
planet:13.residents[*].*;
```

```python title="Response"

NONE
```

The planet 13 is Mustafar, and it has no resident.

### Pros and Cons

With this approach, we can easily validate the data.

We can also easily explore the data.
However, the query system is far from being close from the SparQL query. Also, the schema is not extensible. If we have a new property in the ontology, we will have to update the object, then the schema.

- Validation of the Classes

* Query is harder

## Scenario II: Represent relation using Graph edges

![Graph edges](https://app.flourish.studio/template/75290/thumbnail)

In this approach, we will leverage the power of the **Graph edges** to represent the relation between objects.
In this approach, we will define our global fields for the class planets and use graph edges to link the properties together.

Here is the revised version of our planet object:

```sql
CREATE planet:1 CONTENT {
    label: "Tatooine",
    desc: "A fictional desert planet that appears in the Star Wars space opera franchise."
```

Now that we have the planet object, we will represent the Type:

```rust
RELATE planet:1->a->prefix:voc; // Assumptions = name of the class voc:Planet
```

Here we reuse the prefix table to link the planet object to the class of the planet.

### Query the data

We this approach, we can easily query the data in a manner similar to SparQL.

```sql
planet->a->?;
```

```json title="Response"
{
    id: prefix:voc,
    value: 'https://swapi.co/vocabulary/'
},
```

What is really interesting with this approach, is that it gives way more flexibility to the link we can make. Moreover, we can enrich the data linked to have more information about the link.

For example, we could add a lnk to directly connect to a `voc:Planet` object. This way, the representation of the planet object will be more clear and use a more sparQL-like query.

```rust
let $voc: string = "https://swapi.co/vocabulary/";

// TODO Create a schemafull table with the future

CREATE voc:Planet CONTENT {
    suffix: "Planet",
    prefix: $voc,
    key: <future> {string::join('',prefix,name)} // We leverage the power of the future to create a new property
};
```

Now we can link the planet object to the `voc:Planet` object, and we can query the data in a more sparQL-like way.

```sql
RELATE planet:1->a->voc:Planet;
// Discover what is the type of planet:1
planet:1->a->?;
```

```json title="Response"
[
    {   // This value came from the first query
        id: prefix:voc,
		value: 'https://swapi.co/vocabulary/'
	},
	{
        prefix: 'https://swapi.co/vocabulary/',
		id: voc:Planet,
		suffix: 'Planet',
		key: 'https://swapi.co/vocabulary/Planet'
	},
]
```

With this approach, we could imagine, that we link the planet with object that extend the properties information of the planet class.

Here could be the other object that we could link to the planet object. We can't use the schema approach, because we can't link the object to the schema with Graph Edges.

```rust
let $xsd: string = "http://www.w3.org/2001/XMLSchema#";

CREATE voc:rotationPeriod CONTENT {
    suffix: "rotationPeriod",
    prefix: $xsd,
    dataType: "int",
    key: <future> {string::join('',prefix,suffix)}
    value: 23
};

RELATE planet:1->rotate->voc:rotationPeriod;
```

The benefits of this approach is that we can easily explore the data. We can also easily query the data in a sparQL-like way.

To see everything that is linked to the planet object, we can do:

```rust
planet:1->?.*;
planet:1->?->?.*;
```

```json title="Response"
[
	{
		id: populated:aujv5drglv307op2igmw,
		in: planet:1,
		out: voc:population
	},
	{
		id: rotate:6miurnbkg4tebexq3ykz,
		in: planet:1,
		out: voc:rotationPeriod
	}
]

[
	{
		dataType: 'int',
		id: voc:population,
		key: 'http://www.w3.org/2001/XMLSchema#population',
		prefix: 'http://www.w3.org/2001/XMLSchema#',
		suffix: 'population',
		value: 200000
	},
	{
		dataType: 'int',
		id: voc:rotationPeriod,
		key: 'http://www.w3.org/2001/XMLSchema#rotationPeriod',
		prefix: 'http://www.w3.org/2001/XMLSchema#',
		suffix: 'rotationPeriod',
		value: 23
	}
]
```

### Pros and Cons

- Query is more sparQL-like
  As we have seen, we can link data in a form of a graph. This is very powerful and flexible. We can easily explore the data and query it in a sparQL-like way.

- Flexibility: We can link any object to the planet object
  This approach gives a big flexibility to our model.
- Exploration of the data

Nevertheless, this approach as some drawbacks.

- Validation of the object in a Classes
  We can't validate the object in a class. We can't easily know if the object is valid or not, as there is no way to validate relation with SurrealDB. That's why we have to be careful when we link the object together.

- Performance: Linked objects are not indexed
  Also, has surrealDB mention, link data with graph edges is not indexed. Performance issue will arise with a big amount of data.

Tht's why, we will use a mixed approach to represent the ontology in SurrealDB.

### Scenario III: Leverage the power of both Schemafull and Graph edges

In this approach, we will keep every field that is not linked to an object as the property of the Planet Class.

This way, we can constraint this field and validate the data.

```sql
DEFINE TABLE planet schemafull;
DEFINE FIELD label ON TABLE planet TYPE string;
DEFINE FIELD desc ON TABLE planet TYPE string;
DEFINE FIELD terrain ON TABLE planet TYPE option<string>;
DEFINE FIELD climate ON TABLE planet TYPE option<string>;
DEFINE FIELD diameter ON TABLE planet TYPE option<int>;
DEFINE FIELD population ON TABLE planet TYPE option<int>;
DEFINE FIELD orbitalPeriod ON TABLE planet TYPE option<int>;
DEFINE FIELD rotationPeriod ON TABLE planet TYPE option<int>;
DEFINE FIELD surfaceWater ON TABLE planet TYPE option<int>;
DEFINE FIELD gravity ON TABLE planet TYPE option<string>;
//Remove the fields residents and films from our table
//DEFINE FIELD residents ON TABLE planet TYPE option<array<record<character>>>;
//DEFINE FIELD films ON TABLE planet TYPE array<record<film>>;
```

Now we can link the object to the planet object with graph edges.

For example, we will associated planets to characters and the film they appears in.

```rust
RELATE planet:1->appears_in->film:6;
RELATE character:1->resides_in->planet:1;
```

We can now perform complex query to retrieve the data.

_Retrieve where a character has lived_

```rust
SELECT label as name,->resides_in->planet.label as lives_in from character;
```

```json title="Response"
[
  {
    "name": "Luke Skywalker",
    "lives_in": ["Tatooine"]
  }
]
```

_Retrieve the residents and the movie in which a planet appears:_

```rust
SELECT <->resides_in
       <->character.label as residents,label,->appears_in->
       (film where string::starts_with(name, "Revenge of the "))
       .name as appears_in FROM planet;
```

```json title="Response"
[
  {
    "appears_in": ["Revenge of the Syth"],
    "label": "Tatooine",
    "residents": ["Luke Skywalker"]
  },
  {
    "appears_in": [],
    "label": "Mustafar",
    "residents": []
  }
]
```

> [!tips]
> The `string::starts_with` function is a function available in SurrealDB to filter the film that starts with "Revenge of the". It allows to filter in a grainly maner the data.

This allows to make

With this approach, we can query the data to see all the objects linked to the planet object. Also, we can reverse side to have a directionnal approach.

In this approach, we will search for property that are present in all Classes to put them in our the property of our class.
Query the data

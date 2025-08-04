# CGLA-PRO API
Get an overview of CGLA-PRO architecture

## Structured Tree



<!-- **tests/**: Houses your test cases. -->

**alembic/**: Manages database migrations.

**docs/**: Holds documentation files.

<!-- **scripts/**: Contains utility scripts. -->

**requirements.txt**: Lists project dependencies.

# Setup

The first thing to do is to clone the repository:

```sh
$ https://github.com/Elvis-Houssou/CGLA-PRO.git
```

Create a virtual environment to install dependencies in and activate it:

```sh
$ cd your-directory
$ python -m venv venv
$ source venv/bin/activate
```

Then install the dependencies:

```sh
# for fixed version
(venv)$ pip install -r requirements.txt

# or for updated version
#(venv)$ pip install -r dev.txt
```

Note the `(venv)` in front of the prompt. This indicates that this terminal
session operates in a virtual environment set up by `virtualenv2`.

Once `pip` has finished downloading the dependencies:

```sh
# db migrations
(venv)$ alembic upgrade head

# start the server
(venv)$ uvicorn app.main:app --reload
```

# Tools

### Back-end

#### Language:

    Python

#### Frameworks:

    FastAPI
    pydantic

#### Other libraries / tools:

    SQLAlchemy
    starlette
    uvicorn
    python-jose
    alembic

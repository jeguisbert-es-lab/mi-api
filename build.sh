#!/usr/bin/env bash
# Forzar la versión de Python desde runtime.txt
if [ -f runtime.txt ]; then
    PYTHON_VERSION=$(cat runtime.txt | sed 's/python-//')
    pyenv install $PYTHON_VERSION -s
    pyenv global $PYTHON_VERSION
fi

# Instalar dependencias
pip install --upgrade pip
pip install -r requirements.txt

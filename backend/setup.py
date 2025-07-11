from setuptools import setup, find_packages

setup(
    name="baby-name-gen",
    version="1.0.0",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "openai",
        "python-multipart",
        "python-dotenv",
        "httpx",
    ],
)

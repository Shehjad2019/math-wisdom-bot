from langchain_community.tools.wikipedia.tool import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper

def search_wikipedia(query: str) -> str:
    wiki_tool = WikipediaQueryRun(
        api_wrapper=WikipediaAPIWrapper()
    )
    return wiki_tool.run(query)

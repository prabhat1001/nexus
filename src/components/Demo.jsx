import { useState, useEffect } from "react";

import { copy, linkIcon, loader, tick } from "../assets";
import { useLazyGetSummaryQuery } from "../services/article";

const Demo = () => {
  const [article, setArticle] = useState({
    url: "",
    summary: "",
  });

  const [allArticles, setAllArticles] = useState([]);

  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  const [copied, setCopied] = useState("");

  useEffect(() => {
    const articlesFromLocalStorage = JSON.parse(
      localStorage.getItem("articles")
    )
    if (articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data } = await getSummary({ articleUrl: article.url });

    if (data?.summary) {
      const newArticle = { ...article, summary: data.summary };
      const updatedAllArticles = [newArticle, ...allArticles];

      setArticle(newArticle);
      setAllArticles(updatedAllArticles);
    
      localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
    }
  };


  const handleRemove = (articleUrl) => {
    const updatedAllArticles = allArticles.filter((item) => item.url !== articleUrl);
    setAllArticles(updatedAllArticles);
    localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
  }



  const handleCopy = (copyUrl) => {
      setCopied(copyUrl);
      navigator.clipboard.writeText(copyUrl);
      setTimeout(() => setCopied(false), 5000);
  }


  return (
    <section className="mt-16 w-full max-w-xl">
      {/* Search */}
      <div className="flex flex-col w-full gap-2">
        <form
          className="relative flex justify-center items-center"
          onSubmit={handleSubmit}
        >
          <img
            src={linkIcon}
            alt="link_icon"
            className="absolute left-0 my-2 ml-3 w-5"
          />

          <input
            type="url"
            placeholder="Paste the article link"
            value={article.url}
            onChange={(e) => {
              setArticle({
                ...article,
                url: e.target.value,
              });
            }}
            required
            className="url_input peer" // When you need to style an element based on the state of a sibling element, mark the sibling with the peer class, and use peer-* modifiers to style the target element
          />

          <button
            type="submit"
            className="submit_btn 
          peer-focus:border-gray-700 
          peer-focus:text-gray-700"
          >
            ↲
          </button>
        </form>
        {/* Browse URL History */}
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
            {allArticles.map((item, index) => (
              <div
                key={`link-${index}`}
                onClick={() => setArticle(item)}
                className="link_card"
              >
                <div className="copy_btn" onClick={()=>handleCopy(item.url)}>
                  <img 
                    src={copied === item.url ? tick : copy}
                    className="w-[40%] h-[40%] object-contain"
                  />
                </div>
                <p className="flex-1 font-satoshi text-blue-700 font-medium text-sm truncate">
                  {item.url}
                </p>
                <div className="cross_btn" onClick={()=>handleRemove(item.url)}>
                  <img 
                    src="/cross.png"
                    className="w-[40%] h-[40%] object-contain"
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
      {/* Display Results */}
      <div className="my-10 max-w-full flex justify-center items-center">
          {isFetching ? (
            <img src={loader} alt="loader" className="w-20 h-20 object-contain"/>
          ) : error ? (
            <p className="text-red-500 text-center font-inter font-bold ">
              Well, that wasn't supposed to happen...
              <br/>
              <span className="font-satoshi font-normal text-gray-700">
                {error?.data?.error || "Something went wrong!"}
              </span>
            </p>
          ) : (
            article.summary && (
              <div className="flex flex-col gap-3">
                <h2 className="font-satoshi font-bold text-gray-400 sm:text-xl text-xl">
                  Article <span className="blue_gradient">Summary</span>
                </h2>
                <div className="summary_box">
                  <p className="font-inter font-mediumtext-sm text-gray-200">{article.summary}</p>
                </div> 
              </div>
            )
        )}
      </div>
    </section>
  );
};

export default Demo;

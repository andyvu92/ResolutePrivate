import React, {useState, useEffect} from 'react'
import axios from 'axios'
import './App.sass'

export default function App() {
  // APIs
  const documentApi = 'http://resoluteprivate.com.au/wp-json/wp/v2/document?per_page=100'
  const documentCatApi = 'http://resoluteprivate.com.au/wp-json/wp/v2/document_category?per_page=100'

  // INNITIAL STATE
  const [documents, setDocuments] = useState([])
  const [documentCat, setDocumentCat] = useState([])
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false)
  const [isDocumentCatLoaded, setIsDocumentCatLoaded] = useState(false)
  const [selectedCat, setSelectedCat] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [documentsToRender, setDocumentsToRender] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
  })

  useEffect(() => {
    if( document.getElementById('wpadminbar') !== null ){
      setIsAdmin(true)
    }
  }, [])
  
  // DEFAULT CATEGORY ICON
  const defaultCatIcon = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 480 480" style="enable-background:new 0 0 480 480;" xml:space="preserve">
  <g>
    <g>
      <g>
        <path d="M416.992,69.816l-62.64-62.768C349.859,2.521,343.739-0.018,337.36,0H80C66.745,0,56,10.745,56,24v432     c0,13.255,10.745,24,24,24h320c13.255,0,24-10.745,24-24V86.768C424.018,80.409,421.495,74.306,416.992,69.816z M408,456     c0,4.418-3.582,8-8,8H80c-4.418,0-8-3.582-8-8V24c0-4.418,3.582-8,8-8h256v56c0,13.255,10.745,24,24,24h32V80h-32     c-4.418,0-8-3.582-8-8V27.344l53.664,53.776c1.502,1.495,2.343,3.529,2.336,5.648V456z"/>
        <path d="M112,288h112c4.418,0,8-3.582,8-8V120c0-4.418-3.582-8-8-8H112c-4.418,0-8,3.582-8,8v160     C104,284.418,107.582,288,112,288z M120,128h96v144h-96V128z"/>
        <path d="M176,320h-64c-4.418,0-8,3.582-8,8v96c0,4.418,3.582,8,8,8h64c4.418,0,8-3.582,8-8v-96C184,323.582,180.418,320,176,320z      M168,416h-48v-80h48V416z"/>
        <path d="M272,320h-64c-4.418,0-8,3.582-8,8v96c0,4.418,3.582,8,8,8h64c4.418,0,8-3.582,8-8v-96C280,323.582,276.418,320,272,320z      M264,416h-48v-80h48V416z"/>
        <path d="M368,320h-64c-4.418,0-8,3.582-8,8v96c0,4.418,3.582,8,8,8h64c4.418,0,8-3.582,8-8v-96C376,323.582,372.418,320,368,320z      M360,416h-48v-80h48V416z"/>
        <rect x="248" y="112" width="16" height="16"/>
        <rect x="280" y="112" width="96" height="16"/>
        <rect x="248" y="144" width="128" height="16"/>
        <rect x="248" y="176" width="128" height="16"/>
        <rect x="248" y="208" width="128" height="16"/>
        <rect x="248" y="240" width="128" height="16"/>
        <rect x="248" y="272" width="128" height="16"/>
        <rect x="104" y="48" width="16" height="16"/>
        <rect x="136" y="48" width="160" height="16"/>
        <rect x="104" y="80" width="192" height="16"/>
      </g>
    </g>
  </g></svg>`

  axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

  // ITERATE THROUGH PAGES AND GET ALL DOCUMENTS
  const fetchDocuments = async(numPages) => {
    const tempDocuments = []

    for (let page = 1; page <= numPages; page += 1) {
      const document = axios.get(`${documentApi}&page=${page}`)
      tempDocuments.push(document)
    }

    await axios.all(tempDocuments)
      .then(response => {
        const documentData = response.map(res => res.data)
        setDocuments(documentData.flat())
        setDocumentsToRender(documentData.flat())
        setIsDocumentLoaded(true)
      })
      .catch(e => console.log('error fetching documents: ', e))
  }

  // GET ALL DOCUMENT CATEGORIES
  const fetchDocumentCats = () => {
    axios.get(documentCatApi)
      .then(response => {
        setDocumentCat(response.data)
        setIsDocumentCatLoaded(true)
      })
      .catch(e => console.log('error fetching document categories: ', e))
  }

  // FETCH DOCUMENTS IF NOT LOADED
  useEffect(() => {
    const getDocumentTotalPage = async() => {
      const { headers } = await axios(documentApi)
      fetchDocuments(headers['x-wp-totalpages'])
    }
    if (!isDocumentLoaded) {
      getDocumentTotalPage()
    }
  }, [isDocumentLoaded])

  // FETCH DOCUMENT CATEGORIES IF NOT LOADED
  useEffect(() => {
    if (!isDocumentCatLoaded) {
      fetchDocumentCats()
    }
  }, [isDocumentCatLoaded])

  // HANDLE CATEGORY
  // handle category select and filter documents
  const handleCatSelect = (catId) => {
    // de-select current selected category
    if( catId === selectedCat ){
      setSelectedCat(0)
      if(searchTerm !== ''){
        const tempArray = documents.filter(doc => doc.title.rendered.toLowerCase().includes(searchTerm.toLowerCase()))
        setDocumentsToRender(tempArray)
      } else {
        setDocumentsToRender(documents)
      }
    // select a category
    } else {
      setSelectedCat(catId)
      if(searchTerm !== ''){
        const tempArray = documents.filter(doc => doc.document_category.includes(catId)
                                                && doc.title.rendered.toLowerCase().includes(searchTerm.toLowerCase()) )
        setDocumentsToRender(tempArray)        
      } else {
        const tempArray = documents.filter(doc => doc.document_category.includes(catId))
        setDocumentsToRender(tempArray)
      }
    }
  }
  
  // HANDLE SEARCH TERM INPUT
  // handle search term input and filter documents
  const handleSearchTerm = (term) => {
    setSearchTerm(term)
    // if term is not empty
    if (term !== ''){
      if(selectedCat !== 0){
        const tempArray = documents.filter(doc => doc.title.rendered.toLowerCase().includes(term.toLowerCase())
                                                        && doc.document_category.includes(selectedCat) )
        setDocumentsToRender(tempArray)
      } else {
        const tempArray = documents.filter(doc => doc.title.rendered.toLowerCase().includes(term.toLowerCase()))
        setDocumentsToRender(tempArray)
      }

    } else {
    // if term is empty
      if(selectedCat !== 0){
        const tempArray = documents.filter(doc => doc.document_category.includes(selectedCat))
        setDocumentsToRender(tempArray)
      } else {
        setDocumentsToRender(documents)
      }
    }
  }

  // ICON FOR SEARCH INPUT
  const createSearchIconMarkup = () => { return {__html: 
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
      <g>
        <g>
          <path d="M508.875,493.792L353.089,338.005c32.358-35.927,52.245-83.296,52.245-135.339C405.333,90.917,314.417,0,202.667,0    S0,90.917,0,202.667s90.917,202.667,202.667,202.667c52.043,0,99.411-19.887,135.339-52.245l155.786,155.786    c2.083,2.083,4.813,3.125,7.542,3.125c2.729,0,5.458-1.042,7.542-3.125C513.042,504.708,513.042,497.958,508.875,493.792z     M202.667,384c-99.979,0-181.333-81.344-181.333-181.333S102.688,21.333,202.667,21.333S384,102.677,384,202.667    S302.646,384,202.667,384z"/>
        </g>
      </g>
    </svg>`}}

  // ICON FOR LOADING SCREEN
  const createLoadingIconMarkup = () => { return {__html:
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 524.8 524.8" style="enable-background:new 0 0 524.8 524.8;" xml:space="preserve">
    <g>
      <path style="fill:#193651;" d="M267.2,385.6l-0.8-16c4.8,0,9.6-0.8,14.4-1.6l3.2,16C279.2,384.8,273.6,384.8,267.2,385.6z    M241.6,384c-5.6-0.8-11.2-2.4-16.8-4l4.8-15.2c4.8,1.6,9.6,2.4,14.4,3.2L241.6,384z M308.8,376l-6.4-15.2c4.8-1.6,8.8-4,13.6-6.4   l8,13.6C319.2,371.2,314.4,374.4,308.8,376z M201.6,369.6c-4.8-3.2-9.6-5.6-14.4-9.6l9.6-12.8c4,3.2,8,5.6,12.8,8L201.6,369.6z    M344.8,353.6l-10.4-12c4-3.2,7.2-7.2,10.4-10.4l12,10.4C353.6,345.6,349.6,349.6,344.8,353.6z M168.8,342.4   c-4-4-7.2-8.8-10.4-13.6L172,320c2.4,4,5.6,8,8.8,12L168.8,342.4z M371.2,320l-14.4-7.2c2.4-4,4-8.8,6.4-13.6l15.2,5.6   C376,309.6,373.6,315.2,371.2,320z M147.2,305.6c-2.4-5.6-4-11.2-4.8-16l16-3.2c0.8,4.8,2.4,9.6,4,14.4L147.2,305.6z M384,279.2   l-16-2.4c0.8-4.8,0.8-9.6,0.8-15.2v-3.2l16-0.8c0,0.8,0,2.4,0,3.2C385.6,268,384.8,273.6,384,279.2z M139.2,264v-1.6   c0-4.8,0-10.4,0.8-15.2l16,1.6c-0.8,4.8-0.8,8.8-0.8,13.6v1.6H139.2z M366.4,237.6c-0.8-4.8-2.4-9.6-4.8-14.4l15.2-5.6   c2.4,5.6,4,10.4,4.8,16L366.4,237.6z M161.6,227.2l-15.2-4.8c1.6-5.6,4-10.4,6.4-16l14.4,7.2C164.8,218.4,163.2,222.4,161.6,227.2z    M352,203.2c-2.4-4-5.6-8-8.8-12l12-10.4c4,4,7.2,8.8,10.4,13.6L352,203.2z M179.2,195.2l-12.8-10.4c3.2-4.8,7.2-8.8,12-12.8   l11.2,12C185.6,187.2,182.4,191.2,179.2,195.2z M326.4,176.8c-4-3.2-8-5.6-12.8-8l8-14.4c4.8,2.4,9.6,5.6,14.4,9.6L326.4,176.8z    M207.2,170.4l-8-13.6c4.8-3.2,9.6-5.6,15.2-8l6.4,14.4C216,165.6,211.2,168,207.2,170.4z M293.6,160c-4.8-1.6-9.6-2.4-14.4-3.2   l2.4-16c5.6,0.8,11.2,2.4,16.8,4L293.6,160z M241.6,157.6l-3.2-16c5.6-0.8,11.2-1.6,16.8-2.4l0.8,16   C251.2,156,246.4,156.8,241.6,157.6z"/>
      <path style="fill:#193651;" d="M399.2,437.6l-9.6-12.8c4-3.2,8-6.4,12-9.6l10.4,12C408,430.4,404,434.4,399.2,437.6z M424,415.2   L412,404c3.2-4,7.2-7.2,10.4-11.2l12,10.4C431.2,407.2,428,411.2,424,415.2z M444.8,389.6l-12.8-8.8c2.4-4,4.8-7.2,7.2-11.2l13.6,8   C450.4,381.6,448,385.6,444.8,389.6z"/>
      <path style="fill:#193651;" d="M262.4,484.8c-0.8,0-1.6,0-2.4,0v-16c40,0.8,79.2-11.2,112.8-32.8l8.8,13.6   C346.4,472.8,304.8,484.8,262.4,484.8z"/>
      <path style="fill:#193651;" d="M88.8,150.4l-13.6-8.8c1.6-2.4,3.2-4.8,4.8-6.4l12.8,8.8C91.2,146.4,90.4,148,88.8,150.4z    M102.4,132l-12-10.4c3.2-4,7.2-8.8,11.2-12.8l12,11.2C108.8,124,105.6,128,102.4,132z M123.2,109.6l-10.4-12c4-4,8-7.2,12.8-10.4   l9.6,12.8C131.2,103.2,127.2,106.4,123.2,109.6z"/>
      <path style="fill:#193651;" d="M151.2,88l-8.8-12.8C179.2,52,220.8,40,264,40v16C224.8,55.2,184.8,66.4,151.2,88z"/>
    </g>
    <polygon style="fill:#FFFFFF;" points="261.6,443.2 205.6,476.8 261.6,510.4 "/>
    <path style="fill:#193651;" d="M269.6,524.8l-79.2-48l79.2-47.2V524.8z M221.6,476.8l32,19.2v-38.4L221.6,476.8z"/>
    <polygon style="fill:#FFFFFF;" points="264,81.6 320,48 264,14.4 "/>
    <g>
      <path style="fill:#193651;" d="M256,95.2V0l79.2,47.2L256,95.2z M272,28.8v38.4L304,48L272,28.8z"/>
      <path style="fill:#193651;" d="M145.6,452c-4-2.4-7.2-4.8-10.4-7.2L144,432c3.2,2.4,6.4,4.8,9.6,6.4L145.6,452z M121.6,435.2   c-4-3.2-8.8-7.2-12.8-11.2l11.2-12c4,3.2,8,7.2,11.2,10.4L121.6,435.2z M97.6,412c-4-4-7.2-8-10.4-12.8l12.8-9.6   c3.2,4,6.4,8,9.6,12L97.6,412z"/>
      <path style="fill:#193651;" d="M75.2,382.4C52,345.6,40,304,40,260.8h16c0,40,11.2,79.2,32.8,112.8L75.2,382.4z"/>
      <path style="fill:#193651;" d="M424.8,135.2c-3.2-4-6.4-8-9.6-12l12-10.4c4,4,7.2,8,10.4,12.8L424.8,135.2z M404,112.8   c-4-3.2-8-7.2-11.2-10.4l10.4-12.8c4,3.2,8.8,7.2,12.8,11.2L404,112.8z M380.8,92.8c-2.4-1.6-4.8-3.2-7.2-4.8l8.8-13.6   c2.4,1.6,5.6,3.2,8,5.6L380.8,92.8z"/>
      <path style="fill:#193651;" d="M484.8,264h-16c0-40-11.2-79.2-32.8-112.8l13.6-8.8C473.6,179.2,485.6,221.6,484.8,264z"/>
    </g>
    <polygon style="fill:#FFFFFF;" points="81.6,261.6 48,205.6 14.4,261.6 "/>
    <path style="fill:#193651;" d="M95.2,269.6H0l48-79.2L95.2,269.6z M28.8,253.6h38.4l-19.2-32L28.8,253.6z"/>
    <polygon style="fill:#FFFFFF;" points="443.2,264 476.8,320 510.4,264 "/>
    <path style="fill:#193651;" d="M476.8,336l-47.2-79.2h95.2L476.8,336z M457.6,272l19.2,32l19.2-32H457.6z"/>
    </svg>`
  }}

  return (
    <div id="document-app-grid">
      { isDocumentLoaded & isDocumentCatLoaded ? (
        <React.Fragment>
          <div className="document-cat-grid">
            { documentCat.sort((a, b) => a.acf.order - b.acf.order).map(cat => {
                let icon = ''
                // if category icon is empty
                if( cat.acf.icon === '' ){
                  icon = defaultCatIcon
                } else {
                  icon = cat.acf.icon
                }
                function createCatIconMarkup() { return {__html: icon}}
                return (
                  <div key={cat.id} className={cat.id === selectedCat ? "single-cat active" : "single-cat"}
                  onClick={() => {handleCatSelect(cat.id)}} >
                    <div className="cat-icon" dangerouslySetInnerHTML={createCatIconMarkup()} />
                    <div className="cat-label">{cat.name}</div>
                  </div>
                )
              })
            }
          </div>

          <div className="search-doc">
            <div className="search-icon" dangerouslySetInnerHTML={createSearchIconMarkup()} />
            <input className="search-field" type="text" placeholder="Type to search"
              value={searchTerm}
              onChange={(e) => {handleSearchTerm(e.target.value)}} />
          </div>

          <div className="document-grid">
            { documentsToRender.length > 0 ? (
              documentsToRender.sort((a,b) => (a.title.rendered > b.title.rendered) ? 1 : ((b.title.rendered > a.title.rendered) ? -1 : 0) ).map(doc => {
                const catIcon = documentCat.find(x => x.id === doc.document_category[0])
                let icon = ''
                //if category icon is empty
                if( catIcon !== undefined ){
                  if( catIcon.acf.icon === '' ){
                    icon = defaultCatIcon
                  } else {
                    icon = catIcon.acf.icon
                  }
                } else {
                  icon = defaultCatIcon
                }
                function createCatIconMarkup() { return {__html: icon}}
                
                return (
                  <div key={doc.id} className="single-doc">
                    <div className="doc-icon" dangerouslySetInnerHTML={createCatIconMarkup()} />
                    <div className="doc-content">
                      <p className="doc-label">{doc.title.rendered}</p>
                      <div className="version-list">
                        { doc.acf.document_list.map(version => {
                          return (
                            <div key={version.version_date} className="single-version">
                              <div className="version-date">
                                <label>Date:</label>
                                <p className="date">{version.version_date}</p>
                              </div>
                          <a className="version-url" href={version.upload_document} target="_blank" rel="noopener noreferrer">{windowWidth > 570 ? 'View Document' : 'View'}</a>
                            </div>
                          )
                        }) }
                      </div>
                      { isAdmin &&
                        <a className="edit-document-url" href={`/wp-admin/post.php?post=${doc.id}&action=edit`} target="_blank" rel="noopener noreferrer" >Edit</a>
                      }
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="no-document-found-label">No documents found</p>
            )
            }
          </div>
        </React.Fragment>
      ) : (
        <div className="document-loading-container">
          <div className="spinner" dangerouslySetInnerHTML={createLoadingIconMarkup()} />
        </div>
      )}
    </div>
  );
}

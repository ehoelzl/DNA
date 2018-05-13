import React, { Component } from 'react';
import { Document, Page } from 'react-pdf';

class ViewerPDF extends Component {

  constructor(props){
    super(props)
    this.state = {
      numPages: null,
      pageNumber: 1,
      url : props.url
    }
  }

  onDocumentLoad = ({ numPages }) => {
    this.setState({ numPages });
  };

  render() {
    const { pageNumber, numPages } = this.state;

    return (
      <div>
        <Document
          file="somefile.pdf"
          onLoadSuccess={this.onDocumentLoad}
        >
          <Page pageNumber={pageNumber} />
        </Document>
        <p>Page {pageNumber} of {numPages}</p>
      </div>
    );
  }
}

export default ViewerPDF
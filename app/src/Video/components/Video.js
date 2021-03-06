
import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import axios from 'axios';
import Loader from '../../General/components/Loader';


class Video extends Component {

  state = {
    status: 'start', progress: 0, trackFr: null, trackEn: null, error: '0',
  };

  componentDidMount() {
    const { id, hash } = this.props.match.params;
    const { locale } = this.props.intl;
    const lang = locale === 'fr-fr' ? 'fr' : 'en';
    this.stream = `/api/movie/stream/${id}/${hash}`;
    const startTorrent = `/api/movie/startTorrent/${id}/${hash}`;
    const getStatus = `/api/movie/getStatus/${id}/${hash}`;
    axios.get(startTorrent)
    .then(({ data: { err } }) => {
      if (!err) {
        this.setState({ status: 'created' });
        axios.get(`/api/movie/subtitle/${id}/${hash}`)
        .then(({ data: { frSubFilePath, enSubFilePath } }) => {
          this.trackFr = this.makeTrack(lang, 'Français', 'fr', frSubFilePath);
          this.trackEn = this.makeTrack(lang, 'English', 'en', enSubFilePath);
          this.setState({ status: 'progress' });
        });
      }
    });
    this.inter = setInterval(() => {
      if (this.state.status === 'progress') {
        axios.get(getStatus)
          .then(({ data: { progress, err } }) => {
            if (err) {
              clearInterval(this.inter);
              this.setState({ status: 'error', error: err });
            } else if (progress >= 100) {
              clearInterval(this.inter);
              this.setState({ status: 'loaded' });
            }
            this.setState({ progress });
          });
      }
    }, 5000);
  }

  componentWillUnmount() {
    if (this.inter) clearInterval(this.inter);
  }

  makeTrack = (primary, label, lang, subPath) => {
    if (!subPath || subPath === 'none') {
      const newLabel = lang === 'fr' ? `${label} indisponible` : `${label} unavailable`;
      return <track kind="subtitles" label={newLabel} srcLang={lang} src={subPath} />;
    }
    if (primary === lang) return <track kind="subtitles" label={label} srcLang={lang} src={`/static/${subPath}`} default />;
    return <track kind="subtitles" label={label} srcLang={lang} src={`/static/${subPath}`} />;
  }

  deleter = (e) => {
    e.preventDefault();
    const { id, hash } = this.props.match.params;
    const url = `/api/movie/clear/${id}/${hash}`;
    axios.get(url)
      .then(() => {
        window.location.reload();
      });
  }

  render() {
    const { progress, status } = this.state;
    const starting = this.props.intl.formatMessage({ id: 'video.starting' });
    const getSub = this.props.intl.formatMessage({ id: 'video.getSub' });
    const loading = this.props.intl.formatMessage({ id: 'video.loading' });
    if (status !== 'loaded') {
      if (status === 'start') return <span>{starting}<Loader /></span>;
      else if (status === 'created') return <span>{getSub}<Loader /></span>;
      else if (status === 'error') {
        const err = this.props.intl.formatMessage({ id: this.state.error });
        return <span>{err} <a href="" onClick={this.deleter}>click here to fix</a></span>;
      }
      return <span>{loading} {progress}%<Loader /></span>;
    }
    return (
      <video id="videoPlayer" autoPlay controls>
        <source src={this.stream} type="video/mp4" />
        { this.trackEn }
        { this.trackFr }
      </video>
    );
  }
}

export default injectIntl(Video);
